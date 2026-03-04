#!/usr/bin/env node
import path from 'node:path';
import { access } from 'node:fs/promises';

import { readMcpServerConfig } from '../lib/codex-config.js';
import { parseCliArgs } from '../lib/cli-args.js';
import { loadEnvFile } from '../lib/env-file.js';
import { extractFigmaSnapshot } from '../lib/figma-extract.js';
import { validateFigmaFileUrl } from '../lib/figma-url.js';
import { paths } from '../lib/paths.js';

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findWorkspaceRoot(startDirectory) {
  let current = path.resolve(startDirectory);
  const root = path.parse(current).root;

  while (true) {
    if (await fileExists(path.resolve(current, 'pnpm-workspace.yaml'))) {
      return current;
    }

    if (current === root) {
      return null;
    }

    current = path.dirname(current);
  }
}

async function loadDefaultEnvFiles() {
  const candidates = [];
  const cwdEnvPath = path.resolve(process.cwd(), '.env');
  candidates.push(cwdEnvPath);

  const workspaceRoot = await findWorkspaceRoot(process.cwd());

  if (workspaceRoot) {
    const workspaceEnvPath = path.resolve(workspaceRoot, '.env');

    if (!candidates.includes(workspaceEnvPath)) {
      candidates.push(workspaceEnvPath);
    }
  }

  const loadedPaths = [];

  for (const envPath of candidates) {
    if (await fileExists(envPath)) {
      await loadEnvFile(envPath);
      loadedPaths.push(envPath);
    }
  }

  return loadedPaths;
}

function printUsage() {
  process.stdout.write(
    [
      'Usage: pnpm --filter @prism/ui-core figma:extract -- --file-url <url> [--transport <rest|mcp>] [options]',
      '',
      'Options:',
      '  --file-url      Figma file URL (required), e.g. https://www.figma.com/design/<fileKey>/<fileName>',
      '  --transport     Extraction transport: rest | mcp (default: rest)',
      '  --access-token  Figma access token for REST transport (optional if FIGMA_ACCESS_TOKEN is set)',
      '  --env-file      Optional .env file path for REST transport token loading (default: package + workspace .env)',
      '  --server        MCP server name from Codex config (default: figma_console)',
      '  --config        Path to Codex config.toml (default: ~/.codex/config.toml)',
      '  --no-refresh    Disable figma_get_variables refreshCache flag',
      '  --initialize-timeout-ms MCP initialize timeout (default: 90000)',
      '  --timeout-ms    Request timeout for figma_get_variables (default: 120000)',
      '  --bridge-wait-ms Additional wait for Desktop Bridge/CDP connection after MCP init (default: 30000)',
      '  --help          Show this help message'
    ].join('\n') + '\n'
  );
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.flags.help) {
    printUsage();
    return;
  }

  const rawFileUrl = typeof args.flags['file-url'] === 'string' ? args.flags['file-url'] : undefined;

  if (!rawFileUrl) {
    throw new Error(
      'Missing required --file-url. Example: pnpm --filter @prism/ui-core figma:extract -- --file-url https://www.figma.com/design/<fileKey>/<fileName>'
    );
  }

  const fileUrl = validateFigmaFileUrl(rawFileUrl);
  const transportRaw =
    typeof args.flags.transport === 'string'
      ? args.flags.transport
      : process.env.PRISM_FIGMA_EXTRACT_TRANSPORT ?? 'rest';
  const transport = transportRaw.toLowerCase();
  const timeoutFlag = args.flags['timeout-ms'];
  const initializeTimeoutFlag = args.flags['initialize-timeout-ms'];
  const bridgeWaitFlag = args.flags['bridge-wait-ms'];
  const envFileFlag = typeof args.flags['env-file'] === 'string' ? args.flags['env-file'] : undefined;
  const accessTokenFlag = typeof args.flags['access-token'] === 'string' ? args.flags['access-token'] : undefined;
  const requestTimeoutMs =
    typeof timeoutFlag === 'string' ? Number.parseInt(timeoutFlag, 10) : 120_000;
  const initializeTimeoutMs =
    typeof initializeTimeoutFlag === 'string' ? Number.parseInt(initializeTimeoutFlag, 10) : 90_000;
  const bridgeWaitMs =
    typeof bridgeWaitFlag === 'string' ? Number.parseInt(bridgeWaitFlag, 10) : 30_000;

  if (!Number.isFinite(requestTimeoutMs) || requestTimeoutMs <= 0) {
    throw new Error(`Invalid --timeout-ms value: ${String(timeoutFlag)}.`);
  }

  if (!Number.isFinite(initializeTimeoutMs) || initializeTimeoutMs <= 0) {
    throw new Error(`Invalid --initialize-timeout-ms value: ${String(initializeTimeoutFlag)}.`);
  }

  if (!Number.isFinite(bridgeWaitMs) || bridgeWaitMs < 0) {
    throw new Error(`Invalid --bridge-wait-ms value: ${String(bridgeWaitFlag)}.`);
  }

  if (transport !== 'rest' && transport !== 'mcp') {
    throw new Error(`Invalid --transport value \"${transportRaw}\". Use \"rest\" or \"mcp\".`);
  }

  process.stdout.write(`Using transport: ${transport}\n`);
  process.stdout.write(`Using file URL: ${fileUrl}\n`);

  const refreshCache = args.flags['no-refresh'] ? false : true;

  let mcpConfig;
  let accessToken;

  if (transport === 'rest') {
    if (envFileFlag) {
      const envFilePath = path.resolve(process.cwd(), envFileFlag);
      process.stdout.write(`Loading REST environment: ${envFilePath}\n`);
      await loadEnvFile(envFilePath);
    } else {
      const loadedPaths = await loadDefaultEnvFiles();

      if (loadedPaths.length > 0) {
        process.stdout.write(`Loaded REST environment files: ${loadedPaths.join(', ')}\n`);
      } else {
        process.stdout.write('No .env file found in package or workspace root.\n');
      }
    }

    accessToken =
      accessTokenFlag ??
      process.env.FIGMA_ACCESS_TOKEN ??
      process.env.PRISM_FIGMA_ACCESS_TOKEN ??
      '';

    if (accessToken.trim().length === 0) {
      throw new Error(
        'REST extraction requires FIGMA_ACCESS_TOKEN. Set it in .env, PRISM_FIGMA_ACCESS_TOKEN, or pass --access-token.'
      );
    }

    process.stdout.write('Requesting variables from Figma via REST API...\n');
  } else {
    process.stdout.write('Resolving MCP server configuration...\n');

    mcpConfig = await readMcpServerConfig({
      serverName: typeof args.flags.server === 'string' ? args.flags.server : undefined,
      configPath: typeof args.flags.config === 'string' ? args.flags.config : undefined
    });

    process.stdout.write(`Using MCP server: ${mcpConfig.serverName}\n`);
    process.stdout.write('Requesting variables from Figma via MCP...\n');
  }

  const result = await extractFigmaSnapshot({
    transport,
    mcpConfig,
    fileUrl,
    accessToken,
    refreshCache,
    initializeTimeoutMs,
    requestTimeoutMs,
    bridgeWaitMs,
    onProgress: (message) => {
      process.stdout.write(`${message}\n`);
    },
    snapshotsDirectory: paths.snapshotsDirectory,
    latestSnapshotPath: paths.latestSnapshotPath
  });

  process.stdout.write(
    [
      'Figma extraction complete.',
      `- Source: ${result.snapshot.source.transport}/${result.snapshot.source.toolName}`,
      `- Server: ${result.snapshot.source.serverName}`,
      `- Collection: ${result.snapshot.collection.name}`,
      `- Variables: ${result.snapshot.collection.variables.length}`,
      `- Content hash: ${result.snapshot.contentHash}`,
      `- Snapshot: ${result.snapshotPath}`,
      `- Latest: ${result.latestSnapshotPath}`
    ].join('\n') + '\n'
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`figma:extract failed: ${message}\n`);

  if (message.includes('timed out')) {
    process.stderr.write(
      'Hint: verify Figma Desktop Bridge is running and MCP server figma_console is reachable. ' +
        'You can increase timeout with --timeout-ms <number>.\n'
    );
  }

  if (message.includes('403') || message.includes('Variables API access')) {
    process.stderr.write(
      'Hint: verify FIGMA_ACCESS_TOKEN has access to the file/workspace and Variables API permissions.\n'
    );
  }

  process.exitCode = 1;
});
