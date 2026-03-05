#!/usr/bin/env node
import { checkAuthoringBoundary } from '../lib/boundary-check.js';
import { paths } from '../lib/paths.js';

async function main() {
  const result = await checkAuthoringBoundary(paths.uiCoreDirectory);

  if (result.violationCount === 0) {
    process.stdout.write('Authoring boundary check passed.\n');
    return;
  }

  process.stderr.write('Authoring boundary check failed. Illegal imports from authoring/** detected:\n');

  for (const violation of result.violations) {
    process.stderr.write(`- ${violation.filePath}: ${violation.specifier}\n`);
  }

  process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(
    `check-authoring-boundaries failed: ${error instanceof Error ? error.message : String(error)}\n`
  );
  process.exitCode = 1;
});
