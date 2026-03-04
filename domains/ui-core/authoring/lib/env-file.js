import { readFile } from 'node:fs/promises';

function stripInlineComment(value) {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === '#' && !inSingleQuote && !inDoubleQuote) {
      return value.slice(0, index).trim();
    }
  }

  return value.trim();
}

function normalizeValue(rawValue) {
  const value = stripInlineComment(rawValue);

  if (value.length === 0) {
    return '';
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    const unquoted = value.slice(1, -1);
    return value.startsWith('"') ? unquoted.replace(/\\n/g, '\n') : unquoted;
  }

  return value;
}

export function parseEnvText(source) {
  const result = {};

  for (const rawLine of source.split(/\r?\n/)) {
    const trimmed = rawLine.trim();

    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }

    const line = trimmed.startsWith('export ') ? trimmed.slice('export '.length).trim() : trimmed;
    const equalsIndex = line.indexOf('=');

    if (equalsIndex < 1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    const rawValue = line.slice(equalsIndex + 1);

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    result[key] = normalizeValue(rawValue);
  }

  return result;
}

export async function loadEnvFile(filePath, options = {}) {
  const { override = false } = options;

  let source;

  try {
    source = await readFile(filePath, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }

  const parsed = parseEnvText(source);

  for (const [key, value] of Object.entries(parsed)) {
    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return parsed;
}
