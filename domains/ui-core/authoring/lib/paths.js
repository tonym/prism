import path from 'node:path';
import { fileURLToPath } from 'node:url';

const authoringDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiCoreDirectory = path.resolve(authoringDirectory, '..');

export const paths = {
  authoringDirectory,
  uiCoreDirectory,
  prismTokensSource: path.resolve(uiCoreDirectory, 'src/prism-tokens.ts'),
  snapshotsDirectory: path.resolve(authoringDirectory, 'snapshots/figma'),
  latestSnapshotPath: path.resolve(authoringDirectory, 'snapshots/figma/latest.json'),
  mappingPath: path.resolve(authoringDirectory, 'mappings/figma-token-map.json'),
  reportsDirectory: path.resolve(authoringDirectory, 'reports')
};

export function resolveWithinUiCore(...segments) {
  return path.resolve(uiCoreDirectory, ...segments);
}
