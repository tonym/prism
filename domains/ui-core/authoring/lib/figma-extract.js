import path from 'node:path';

import { writeStableJson } from './file-io.js';
import { StdioMcpClient } from './mcp-stdio-client.js';
import { paths } from './paths.js';
import { buildNormalizedSnapshot } from './snapshot-schema.js';

const READ_ONLY_TOOL_NAMES = new Set(['figma_get_variables']);

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

export async function extractFigmaSnapshot(options) {
  const {
    mcpConfig,
    fileUrl,
    refreshCache = true,
    snapshotsDirectory = paths.snapshotsDirectory,
    latestSnapshotPath = paths.latestSnapshotPath
  } = options;

  const toolName = 'figma_get_variables';
  ensureReadOnlyToolName(toolName);

  const client = new StdioMcpClient(mcpConfig);

  try {
    await client.start();

    const payload = await client.callTool(toolName, {
      fileUrl,
      format: 'full',
      verbosity: 'standard',
      refreshCache,
      useConsoleFallback: false
    });

    if (payload && typeof payload === 'object' && typeof payload.error === 'string') {
      throw new Error(`figma_get_variables returned an application error: ${payload.error}`);
    }

    const snapshot = buildNormalizedSnapshot(payload, {
      serverName: mcpConfig.serverName
    });

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
  } finally {
    await client.close();
  }
}
