#!/usr/bin/env node
import { parseCliArgs } from '../lib/cli-args.js';
import { inferCanonicalRepoTokenKeys } from '../lib/token-key-inference.js';
import { readSnapshotFile } from '../lib/snapshot-file.js';
import { readMappingFile } from '../lib/mapping-file.js';
import { buildAlignmentReport, assertNoStructuralErrors } from '../lib/map-check.js';
import { writeAlignmentReport } from '../lib/report-file.js';
import { paths } from '../lib/paths.js';

function printUsage() {
  process.stdout.write(
    [
      'Usage: pnpm --filter @prism/ui-core figma:map:check [--snapshot <path>] [--mapping <path>]',
      '',
      'Options:',
      '  --snapshot   Snapshot path (default: authoring/snapshots/figma/latest.json)',
      '  --mapping    Mapping file path (default: authoring/mappings/figma-token-map.json)',
      '  --help       Show this help message'
    ].join('\n') + '\n'
  );
}

function printReportSummary(report, reportPath) {
  const warningLines = report.warnings.map((warning) => `  - [WARN] ${warning.code}: ${warning.message}`);
  const errorLines = report.errors.map((error) => `  - [ERROR] ${error.code}: ${error.message}`);

  process.stdout.write(
    [
      'Figma mapping alignment report:',
      `- Report: ${reportPath}`,
      `- Errors: ${report.summary.errors}`,
      `- Warnings: ${report.summary.warnings}`,
      `- Snapshot variables: ${report.snapshot.variableCount}`,
      `- Mapping entries: ${report.mapping.entryCount}`,
      `- Repo token keys: ${report.repo.tokenKeyCount}`,
      '',
      'Warnings:',
      warningLines.length > 0 ? warningLines.join('\n') : '  - <none>',
      '',
      'Errors:',
      errorLines.length > 0 ? errorLines.join('\n') : '  - <none>'
    ].join('\n') + '\n'
  );
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.flags.help) {
    printUsage();
    return;
  }

  const snapshotPath = typeof args.flags.snapshot === 'string' ? args.flags.snapshot : paths.latestSnapshotPath;
  const mappingPath = typeof args.flags.mapping === 'string' ? args.flags.mapping : paths.mappingPath;

  const [snapshot, mapping, repoKeyResult] = await Promise.all([
    readSnapshotFile(snapshotPath),
    readMappingFile(mappingPath),
    inferCanonicalRepoTokenKeys()
  ]);

  const report = buildAlignmentReport({
    snapshot,
    mapping,
    repoTokenKeys: repoKeyResult.keys
  });

  const reportWriteResult = await writeAlignmentReport(paths.reportsDirectory, report);
  printReportSummary(report, reportWriteResult.reportPath);

  assertNoStructuralErrors(report);
}

main().catch((error) => {
  process.stderr.write(`figma:map:check failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
