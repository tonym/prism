import { prismCoreThemeTokens } from '../prism-tokens.js';
import type { DeepPartial, PrismTheme, ThemeOverride } from './types.js';

type PlainRecord = Record<string, unknown>;

const THEME_STRUCTURE_TEMPLATE: PlainRecord = prismCoreThemeTokens as unknown as PlainRecord;

function isPlainRecord(value: unknown): value is PlainRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function describeType(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
}

function formatPath(path: string[]): string {
  return path.length === 0 ? '<root>' : path.join('.');
}

function validateThemeLayer(
  layer: unknown,
  template: PlainRecord,
  layerName: string,
  allowPartial: boolean,
  path: string[] = []
): void {
  if (!isPlainRecord(layer)) {
    throw new Error(`${layerName} must be an object at ${formatPath(path)}.`);
  }

  for (const key of Object.keys(layer)) {
    if (!Object.prototype.hasOwnProperty.call(template, key)) {
      throw new Error(`Unknown key in ${layerName} at ${formatPath([...path, key])}.`);
    }
  }

  for (const key of Object.keys(template)) {
    const nextPath = [...path, key];
    const templateValue = template[key];
    const hasKey = Object.prototype.hasOwnProperty.call(layer, key);

    if (!hasKey) {
      if (!allowPartial) {
        throw new Error(`Missing key in ${layerName} at ${formatPath(nextPath)}.`);
      }
      continue;
    }

    const layerValue = (layer as PlainRecord)[key];
    if (layerValue === undefined) {
      throw new Error(`Undefined values are not allowed in ${layerName} at ${formatPath(nextPath)}.`);
    }

    if (isPlainRecord(templateValue)) {
      if (!isPlainRecord(layerValue)) {
        throw new Error(
          `Type mismatch in ${layerName} at ${formatPath(nextPath)}. ` +
            `Expected object, received ${describeType(layerValue)}.`
        );
      }

      validateThemeLayer(layerValue, templateValue, layerName, allowPartial, nextPath);
      continue;
    }

    if (isPlainRecord(layerValue) || Array.isArray(layerValue)) {
      throw new Error(
        `Type mismatch in ${layerName} at ${formatPath(nextPath)}. ` +
          `Expected ${typeof templateValue}, received ${describeType(layerValue)}.`
      );
    }

    if (typeof layerValue !== typeof templateValue) {
      throw new Error(
        `Type mismatch in ${layerName} at ${formatPath(nextPath)}. ` +
          `Expected ${typeof templateValue}, received ${typeof layerValue}.`
      );
    }
  }
}

function mergeKnownStructure<T extends PlainRecord>(
  base: T,
  layer: DeepPartial<T> | undefined
): T {
  const merged: PlainRecord = {};
  const source = (layer ?? {}) as PlainRecord;

  for (const key of Object.keys(base)) {
    const baseValue = base[key];
    const hasOverride = Object.prototype.hasOwnProperty.call(source, key);
    const overrideValue = hasOverride ? source[key] : undefined;

    if (isPlainRecord(baseValue)) {
      merged[key] = mergeKnownStructure(
        baseValue,
        hasOverride ? (overrideValue as DeepPartial<PlainRecord>) : undefined
      );
      continue;
    }

    merged[key] = hasOverride ? (overrideValue as unknown) : baseValue;
  }

  return merged as T;
}

export function mergeTheme(
  coreTheme: PrismTheme,
  defaultTheme: ThemeOverride = {},
  overlayTheme: ThemeOverride = {}
): PrismTheme {
  validateThemeLayer(coreTheme, THEME_STRUCTURE_TEMPLATE, 'coreTheme', false);
  validateThemeLayer(defaultTheme, THEME_STRUCTURE_TEMPLATE, 'defaultTheme', true);
  validateThemeLayer(overlayTheme, THEME_STRUCTURE_TEMPLATE, 'overlayTheme', true);

  const withDefaults = mergeKnownStructure(
    coreTheme as unknown as PlainRecord,
    defaultTheme as DeepPartial<PlainRecord>
  );

  return mergeKnownStructure(withDefaults, overlayTheme as DeepPartial<PlainRecord>) as unknown as PrismTheme;
}
