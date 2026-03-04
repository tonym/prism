#!/usr/bin/env node
import { parseCliArgs } from '../lib/cli-args.js';
import { inferCanonicalRepoTokenKeys } from '../lib/token-key-inference.js';
import { readSnapshotFile } from '../lib/snapshot-file.js';
import { readMappingFile, writeMappingFile } from '../lib/mapping-file.js';
import { applySuggestionWrites, generateMappingSuggestions, summarizeSuggestions } from '../lib/map-suggest.js';
import { paths } from '../lib/paths.js';

function printUsage() {
  process.stdout.write(
    [
      'Usage: pnpm --filter @prism/ui-core figma:map:suggest [--snapshot <path>] [--write] [--overwrite]',
      '',
      'Options:',
      '  --snapshot   Snapshot path (default: authoring/snapshots/figma/latest.json)',
      '  --write      Write high-confidence suggestions to mapping file',
      '  --overwrite  Allow write mode to overwrite existing mapping entries',
      '  --help       Show this help message'
    ].join('\n') + '\n'
  );
}

function formatTopSuggestions(suggestions, limit = 12) {
  return suggestions
    .slice(0, limit)
    .map((suggestion) => {
      const candidateList = suggestion.candidates.map((candidate) => candidate.repoTokenKey).join(', ');
      return `  - ${suggestion.variableName} (${suggestion.variableId}) -> ${candidateList || '<none>'} [${suggestion.confidence}]`;
    })
    .join('\n');
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));

  if (args.flags.help) {
    printUsage();
    return;
  }

  const snapshotPath = typeof args.flags.snapshot === 'string' ? args.flags.snapshot : paths.latestSnapshotPath;
  const write = Boolean(args.flags.write);
  const overwrite = Boolean(args.flags.overwrite);

  const [snapshot, repoKeyResult, existingMapping] = await Promise.all([
    readSnapshotFile(snapshotPath),
    inferCanonicalRepoTokenKeys(),
    readMappingFile(paths.mappingPath)
  ]);

  const suggestions = generateMappingSuggestions(snapshot, repoKeyResult.keys);
  const summary = summarizeSuggestions(suggestions);

  const topHighConfidence = suggestions.filter(
    (suggestion) => suggestion.confidence === 'high' && suggestion.candidates.length === 1
  );

  let writeSummary = '- Mapping file unchanged (use --write to apply high-confidence suggestions).';

  if (write) {
    const mappingWithAppliedSuggestions = applySuggestionWrites({
      existingMapping,
      suggestions,
      overwrite
    });

    await writeMappingFile(paths.mappingPath, mappingWithAppliedSuggestions);
    writeSummary = `- Mapping file updated: ${paths.mappingPath}\n- Entries written this run: ${mappingWithAppliedSuggestions.appliedCount}`;
  }

  process.stdout.write(
    [
      'Figma mapping suggestion summary:',
      `- Snapshot: ${snapshotPath}`,
      `- Repo token keys inferred: ${repoKeyResult.keyCount}`,
      `- Variables analyzed: ${summary.total}`,
      `- High confidence: ${summary.high}`,
      `- Medium confidence: ${summary.medium}`,
      `- Low confidence: ${summary.low}`,
      `- Exact single-candidate matches: ${summary.exactSingleCandidate}`,
      `- Ambiguous suggestions: ${summary.ambiguous}`,
      `- Unmatched variables: ${summary.unmatched}`,
      writeSummary,
      '',
      'Top high-confidence suggestions:',
      topHighConfidence.length > 0 ? formatTopSuggestions(topHighConfidence) : '  - <none>'
    ].join('\n') + '\n'
  );
}

main().catch((error) => {
  process.stderr.write(`figma:map:suggest failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
