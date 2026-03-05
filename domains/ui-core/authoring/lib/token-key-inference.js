import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

import ts from 'typescript';

import { paths } from './paths.js';

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge(baseValue, overrideValue) {
  if (!isPlainObject(baseValue) || !isPlainObject(overrideValue)) {
    return overrideValue === undefined ? baseValue : overrideValue;
  }

  const keys = new Set([...Object.keys(baseValue), ...Object.keys(overrideValue)]);
  const merged = {};

  for (const key of keys) {
    const nextBase = baseValue[key];
    const nextOverride = overrideValue[key];

    if (nextOverride === undefined) {
      merged[key] = nextBase;
      continue;
    }

    if (isPlainObject(nextBase) && isPlainObject(nextOverride)) {
      merged[key] = deepMerge(nextBase, nextOverride);
      continue;
    }

    merged[key] = nextOverride;
  }

  return merged;
}

function collectLeafKeys(value, prefix = '') {
  if (!isPlainObject(value)) {
    return prefix ? [prefix] : [];
  }

  const keys = Object.keys(value).sort((left, right) => left.localeCompare(right));
  const leafKeys = [];

  for (const key of keys) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    const nextValue = value[key];
    const nextLeafKeys = collectLeafKeys(nextValue, nextPrefix);

    if (nextLeafKeys.length === 0) {
      leafKeys.push(nextPrefix);
      continue;
    }

    leafKeys.push(...nextLeafKeys);
  }

  return leafKeys;
}

function executePrismTokenModule(sourceText, sourcePath) {
  const transpiled = ts.transpileModule(sourceText, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove
    },
    fileName: sourcePath,
    reportDiagnostics: false
  }).outputText;

  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: () => {
      throw new Error('Runtime requires are not supported while inferring token keys.');
    }
  });

  const script = new vm.Script(transpiled, { filename: sourcePath });
  script.runInContext(context);

  return module.exports;
}

export async function inferCanonicalRepoTokenKeys(options = {}) {
  const sourcePath = options.sourcePath ?? paths.prismTokensSource;
  const sourceText = await readFile(sourcePath, 'utf8');
  const moduleExports = executePrismTokenModule(sourceText, sourcePath);

  const coreTheme = moduleExports.prismCoreThemeTokens;
  const defaultTheme = moduleExports.prismDefaultThemeTokens;
  const overlayTheme = moduleExports.prismOverlayThemeTokens;

  if (!isPlainObject(coreTheme) || !isPlainObject(defaultTheme) || !isPlainObject(overlayTheme)) {
    throw new Error('Unable to infer token keys from prism token exports. Expected core/default/overlay theme exports.');
  }

  const effectiveTheme = deepMerge(deepMerge(coreTheme, defaultTheme), overlayTheme);
  const keys = collectLeafKeys(effectiveTheme).sort((left, right) => left.localeCompare(right));

  return {
    sourcePath,
    keyCount: keys.length,
    keys
  };
}
