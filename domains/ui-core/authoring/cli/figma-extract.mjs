#!/usr/bin/env node
import { readMcpServerConfig } from '../lib/codex-config.js';
import { parseCliArgs } from '../lib/cli-args.js';
import { extractFigmaSnapshot } from '../lib/figma-extract.js';
import { paths } from '../lib/paths.js';

function printUsage() {
  process.stdout.write(
    [
      'Usage: pnpm --filter @prism/ui-core figma:extract [--file-url <url>] [--server <name>] [--config <path>] [--no-refresh]',
      '',
      'Options:',
      '  --file-url      Explicit Figma file URL for figma_get_variables',
      '  --server        MCP server name from Codex config (default: figma_console)',
      '  --config        Path to Codex config.toml (default: ~/.codex/config.toml)',
      '  --no-refresh    Disable figma_get_variables refreshCache flag',
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

  const mcpConfig = await readMcpServerConfig({
    serverName: typeof args.flags.server === 'string' ? args.flags.server : undefined,
    configPath: typeof args.flags.config === 'string' ? args.flags.config : undefined
  });

  const fileUrl = typeof args.flags['file-url'] === 'string' ? args.flags['file-url'] : undefined;
  const refreshCache = args.flags['no-refresh'] ? false : true;

  const result = await extractFigmaSnapshot({
    mcpConfig,
    fileUrl,
    refreshCache,
    snapshotsDirectory: paths.snapshotsDirectory,
    latestSnapshotPath: paths.latestSnapshotPath
  });

  process.stdout.write(
    [
      'Figma extraction complete.',
      `- Server: ${mcpConfig.serverName}`,
      `- Collection: ${result.snapshot.collection.name}`,
      `- Variables: ${result.snapshot.collection.variables.length}`,
      `- Content hash: ${result.snapshot.contentHash}`,
      `- Snapshot: ${result.snapshotPath}`,
      `- Latest: ${result.latestSnapshotPath}`
    ].join('\n') + '\n'
  );
}

main().catch((error) => {
  process.stderr.write(`figma:extract failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
