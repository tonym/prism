import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const PROTECTED_DIRECTORIES = [
  'src/generator',
  'src/determinism',
  'src/status',
  'src/mcp',
  'src/theme',
  'src/css'
];

const ALLOWED_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);

function isAuthoringImport(specifier) {
  const normalized = specifier.replace(/\\/g, '/');
  return (
    normalized.includes('/authoring/') ||
    normalized.startsWith('../authoring') ||
    normalized.startsWith('../../authoring') ||
    normalized.startsWith('../../../authoring') ||
    normalized.startsWith('@prism/ui-core/authoring')
  );
}

async function walkFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.resolve(directoryPath, entry.name);

    if (entry.isDirectory()) {
      const childFiles = await walkFiles(entryPath);
      files.push(...childFiles);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name);

    if (ALLOWED_EXTENSIONS.has(extension)) {
      files.push(entryPath);
    }
  }

  return files;
}

function parseSpecifiers(sourceText) {
  const specifiers = [];

  for (const match of sourceText.matchAll(/(?:import|export)\\s+[^;]*?from\\s+['\"]([^'\"]+)['\"]/g)) {
    const specifier = match[1];

    if (specifier) {
      specifiers.push(specifier);
    }
  }

  for (const match of sourceText.matchAll(/import\\(\\s*['\"]([^'\"]+)['\"]\\s*\\)/g)) {
    const specifier = match[1];

    if (specifier) {
      specifiers.push(specifier);
    }
  }

  return specifiers;
}

export async function checkAuthoringBoundary(uiCoreRootDirectory) {
  const violations = [];

  for (const protectedDirectory of PROTECTED_DIRECTORIES) {
    const targetDirectory = path.resolve(uiCoreRootDirectory, protectedDirectory);
    const files = await walkFiles(targetDirectory);

    for (const filePath of files) {
      const sourceText = await readFile(filePath, 'utf8');
      const specifiers = parseSpecifiers(sourceText);

      for (const specifier of specifiers) {
        if (isAuthoringImport(specifier)) {
          violations.push({ filePath, specifier });
        }
      }
    }
  }

  violations.sort((left, right) => {
    return left.filePath.localeCompare(right.filePath) || left.specifier.localeCompare(right.specifier);
  });

  return {
    checkedDirectories: PROTECTED_DIRECTORIES,
    violationCount: violations.length,
    violations
  };
}
