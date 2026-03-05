import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

import { writeStableJson } from './file-io.js';
import { fetchFigmaVariablesViaRest } from './figma-rest.js';
import { StdioMcpClient } from './mcp-stdio-client.js';
import { paths } from './paths.js';
import { buildNormalizedSnapshot } from './snapshot-schema.js';

const READ_ONLY_TOOL_NAMES = new Set(['figma_get_variables']);
const STATUS_TOOL_NAME = 'figma_get_status';

function formatSnapshotTimestamp(now = new Date()) {
  const iso = now.toISOString();
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function extractSnapshotId(contentHash, now = new Date()) {
  return `${formatSnapshotTimestamp(now)}-${contentHash.slice(0, 8)}`;
}

function ensureReadOnlyToolName(toolName) {
  if (!READ_ONLY_TOOL_NAMES.has(toolName)) {
    throw new Error(`Tool \"${toolName}\" is not in the read-only allowlist.`);
  }
}

async function writeSnapshotArtifacts({
  payload,
  snapshotSource,
  snapshotsDirectory,
  latestSnapshotPath
}) {
  const snapshot = buildNormalizedSnapshot(payload, snapshotSource);
  const snapshotId = extractSnapshotId(snapshot.contentHash);
  const snapshotPath = path.resolve(snapshotsDirectory, `${snapshotId}.json`);

  await writeStableJson(snapshotPath, snapshot);
  await writeStableJson(latestSnapshotPath, snapshot);

  return {
    snapshot,
    snapshotId,
    snapshotPath,
    latestSnapshotPath
  };
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object';
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getTransportSummary(statusPayload) {
  if (!isObject(statusPayload)) {
    return {
      active: 'unknown',
      websocketAvailable: false,
      cdpAvailable: false,
      setupValid: false
    };
  }

  const transport = isObject(statusPayload.transport) ? statusPayload.transport : {};
  const websocket = isObject(transport.websocket) ? transport.websocket : {};
  const cdp = isObject(transport.cdp) ? transport.cdp : {};
  const setup = isObject(statusPayload.setup) ? statusPayload.setup : {};

  return {
    active: typeof transport.active === 'string' ? transport.active : 'unknown',
    websocketAvailable: websocket.available === true,
    cdpAvailable: cdp.available === true,
    setupValid: setup.valid === true
  };
}

function isTransportReady(statusPayload) {
  const summary = getTransportSummary(statusPayload);

  return (
    summary.setupValid ||
    summary.websocketAvailable ||
    summary.cdpAvailable ||
    (summary.active !== 'none' && summary.active !== 'unknown')
  );
}

function formatTransportSummary(statusPayload) {
  const summary = getTransportSummary(statusPayload);

  return [
    `active=${summary.active}`,
    `websocket.available=${summary.websocketAvailable}`,
    `cdp.available=${summary.cdpAvailable}`,
    `setup.valid=${summary.setupValid}`
  ].join(', ');
}

function isAllMethodsFailedError(error) {
  return error instanceof Error && error.message.includes('Cannot retrieve variables. All methods failed');
}

function buildTransportGuidanceError(error, statusPayload) {
  const base = error instanceof Error ? error.message : String(error);

  if (isTransportReady(statusPayload)) {
    return new Error(base);
  }

  return new Error(
    [
      base,
      `Detected no active Figma transport for this MCP process (${formatTransportSummary(statusPayload)}).`,
      'This usually means Desktop Bridge is connected to a different figma-console-mcp instance.',
      'Fix: restart the Figma Desktop Bridge plugin after starting this command, or close other figma-console clients and rerun.'
    ].join('\n')
  );
}

function isNpxFigmaConsoleLaunch(config) {
  if (config.command !== 'npx') {
    return false;
  }

  return config.args.some((arg) => /^figma-console-mcp(?:@.+)?$/.test(arg));
}

function isMcpInitializeError(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes(': initialize') ||
    error.message.includes('Failed to start MCP process') ||
    error.message.includes('exited before responding')
  );
}

async function findCachedFigmaConsoleEntry() {
  const npxRoot = path.resolve(
    process.env.npm_config_cache ?? path.resolve(os.homedir(), '.npm'),
    '_npx'
  );

  let entries;

  try {
    entries = await fs.readdir(npxRoot, {
      withFileTypes: true
    });
  } catch {
    return null;
  }

  const candidates = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const candidatePath = path.resolve(
      npxRoot,
      entry.name,
      'node_modules',
      'figma-console-mcp',
      'dist',
      'local.js'
    );

    try {
      const stats = await fs.stat(candidatePath);

      if (stats.isFile()) {
        candidates.push({
          candidatePath,
          modifiedTimeMs: stats.mtimeMs
        });
      }
    } catch {
      // Ignore cache directories that do not contain figma-console-mcp.
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((left, right) => right.modifiedTimeMs - left.modifiedTimeMs);
  return candidates[0]?.candidatePath ?? null;
}

function createCachedLaunchConfig(config, entryPath) {
  return {
    ...config,
    command: process.execPath,
    args: [entryPath]
  };
}

async function buildLaunchCandidates(mcpConfig, onProgress) {
  if (process.env.PRISM_FIGMA_EXTRACT_FORCE_NPX === '1') {
    return [mcpConfig];
  }

  if (!isNpxFigmaConsoleLaunch(mcpConfig)) {
    return [mcpConfig];
  }

  const cachedEntry = await findCachedFigmaConsoleEntry();

  if (!cachedEntry) {
    return [mcpConfig];
  }

  onProgress?.(
    `Detected cached figma-console-mcp binary. Preferring local entrypoint to avoid npx @latest startup delays: ${cachedEntry}`
  );

  return [createCachedLaunchConfig(mcpConfig, cachedEntry), mcpConfig];
}

async function requestVariablesViaMcp({
  launchConfig,
  toolName,
  fileUrl,
  refreshCache,
  initializeTimeoutMs,
  requestTimeoutMs,
  bridgeWaitMs,
  progressHeartbeatMs,
  onProgress
}) {
  const client = new StdioMcpClient(launchConfig);

  const getStatus = async () => {
    try {
      return await client.callTool(STATUS_TOOL_NAME, {}, Math.min(requestTimeoutMs, 20_000));
    } catch {
      return null;
    }
  };

  try {
    onProgress?.(`Starting MCP server process (initialize timeout ${initializeTimeoutMs}ms)...`);

    const initializeHeartbeat = setInterval(() => {
      onProgress?.('Waiting for MCP initialize response...');
    }, progressHeartbeatMs);

    try {
      await client.start(initializeTimeoutMs);
    } finally {
      clearInterval(initializeHeartbeat);
    }

    onProgress?.(`MCP initialized. Calling ${toolName} (timeout ${requestTimeoutMs}ms)...`);

    onProgress?.('Checking Figma transport status...');
    let statusPayload = await getStatus();

    if (!isTransportReady(statusPayload) && bridgeWaitMs > 0) {
      onProgress?.(
        `No active Figma transport yet (${formatTransportSummary(
          statusPayload
        )}). Waiting up to ${bridgeWaitMs}ms for Desktop Bridge/CDP connection...`
      );

      const deadline = Date.now() + bridgeWaitMs;

      while (Date.now() < deadline) {
        await delay(Math.min(2_000, Math.max(0, deadline - Date.now())));
        statusPayload = await getStatus();

        if (isTransportReady(statusPayload)) {
          onProgress?.(`Figma transport connected (${formatTransportSummary(statusPayload)}).`);
          break;
        }
      }

      if (!isTransportReady(statusPayload)) {
        onProgress?.(
          `Still no active Figma transport (${formatTransportSummary(
            statusPayload
          )}). Proceeding with variable request; it may fail unless the bridge reconnects.`
        );
      }
    }

    const heartbeat = setInterval(() => {
      onProgress?.(`Waiting for ${toolName} response...`);
    }, progressHeartbeatMs);

    try {
      return await client.callTool(
        toolName,
        {
          fileUrl,
          format: 'full',
          verbosity: 'standard',
          refreshCache,
          useConsoleFallback: false
        },
        requestTimeoutMs
      );
    } catch (error) {
      if (isAllMethodsFailedError(error)) {
        throw buildTransportGuidanceError(error, await getStatus());
      }

      throw error;
    } finally {
      clearInterval(heartbeat);
    }
  } finally {
    await client.close();
  }
}

async function extractFigmaSnapshotViaMcp(options) {
  const {
    mcpConfig,
    fileUrl,
    refreshCache = true,
    initializeTimeoutMs = 90_000,
    requestTimeoutMs = 120_000,
    bridgeWaitMs = 30_000,
    progressHeartbeatMs = 15_000,
    onProgress,
    snapshotsDirectory = paths.snapshotsDirectory,
    latestSnapshotPath = paths.latestSnapshotPath
  } = options;

  if (!mcpConfig || typeof mcpConfig !== 'object') {
    throw new Error('MCP extraction requires mcpConfig.');
  }

  const toolName = 'figma_get_variables';
  ensureReadOnlyToolName(toolName);
  const launchCandidates = await buildLaunchCandidates(mcpConfig, onProgress);
  let payload = null;
  let lastError = null;

  for (let candidateIndex = 0; candidateIndex < launchCandidates.length; candidateIndex += 1) {
    const launchConfig = launchCandidates[candidateIndex];
    const isConfiguredLaunch =
      launchConfig.command === mcpConfig.command &&
      JSON.stringify(launchConfig.args) === JSON.stringify(mcpConfig.args);

    if (!isConfiguredLaunch) {
      onProgress?.(`Launching MCP via fallback command: ${launchConfig.command} ${launchConfig.args.join(' ')}`);
    }

    try {
      payload = await requestVariablesViaMcp({
        launchConfig,
        toolName,
        fileUrl,
        refreshCache,
        initializeTimeoutMs,
        requestTimeoutMs,
        bridgeWaitMs,
        progressHeartbeatMs,
        onProgress
      });
      break;
    } catch (error) {
      lastError = error;
      const isLastCandidate = candidateIndex >= launchCandidates.length - 1;

      if (isLastCandidate || !isMcpInitializeError(error)) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      onProgress?.(
        `MCP initialize failed for launch command (${launchConfig.command} ${launchConfig.args.join(
          ' '
        )}). Retrying with configured command. Cause: ${message}`
      );
    }
  }

  if (!payload) {
    throw (lastError ?? new Error('Failed to retrieve variables via MCP.'));
  }

  if (payload && typeof payload === 'object' && typeof payload.error === 'string') {
    throw new Error(`figma_get_variables returned an application error: ${payload.error}`);
  }

  return writeSnapshotArtifacts({
    payload,
    snapshotSource: {
      transport: 'mcp',
      serverName: mcpConfig.serverName,
      toolName
    },
    snapshotsDirectory,
    latestSnapshotPath
  });
}

async function extractFigmaSnapshotViaRest(options) {
  const {
    fileUrl,
    accessToken,
    requestTimeoutMs = 120_000,
    onProgress,
    snapshotsDirectory = paths.snapshotsDirectory,
    latestSnapshotPath = paths.latestSnapshotPath
  } = options;

  const payload = await fetchFigmaVariablesViaRest({
    fileUrl,
    accessToken,
    timeoutMs: requestTimeoutMs,
    onProgress
  });

  return writeSnapshotArtifacts({
    payload,
    snapshotSource: {
      transport: 'rest',
      serverName: 'figma_rest',
      toolName: 'files.variables.local'
    },
    snapshotsDirectory,
    latestSnapshotPath
  });
}

export async function extractFigmaSnapshot(options) {
  const transport = typeof options.transport === 'string' ? options.transport : 'mcp';

  if (transport === 'rest') {
    return extractFigmaSnapshotViaRest(options);
  }

  if (transport === 'mcp') {
    return extractFigmaSnapshotViaMcp(options);
  }

  throw new Error(`Unsupported --transport value \"${transport}\". Use \"rest\" or \"mcp\".`);
}
