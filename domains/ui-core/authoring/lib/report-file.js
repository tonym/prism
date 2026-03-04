import path from 'node:path';

import { sha256 } from './hash.js';
import { writeStableJson } from './file-io.js';
import { stableStringify } from './stable-json.js';

function reportTimestamp(now = new Date()) {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export async function writeAlignmentReport(reportDirectory, report, latestFileName = 'latest.json') {
  const hash = sha256(stableStringify(report)).slice(0, 8);
  const fileName = `figma-map-check-${reportTimestamp()}-${hash}.json`;
  const reportPath = path.resolve(reportDirectory, fileName);
  const latestPath = path.resolve(reportDirectory, latestFileName);

  await writeStableJson(reportPath, report);
  await writeStableJson(latestPath, report);

  return {
    reportPath,
    latestPath
  };
}
