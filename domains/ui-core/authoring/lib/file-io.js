import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { stableStringifyPretty } from './stable-json.js';

export async function ensureDirectory(filePath) {
  const directoryPath = path.dirname(filePath);
  await mkdir(directoryPath, { recursive: true });
}

export async function writeStableJson(filePath, value) {
  await ensureDirectory(filePath);
  await writeFile(filePath, stableStringifyPretty(value), 'utf8');
}

export async function readJson(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function readText(filePath) {
  return readFile(filePath, 'utf8');
}
