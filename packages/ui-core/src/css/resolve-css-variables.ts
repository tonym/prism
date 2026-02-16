import type { PrismTheme } from '../theme/types.js';

export type CssVariableMap = Readonly<Record<string, string>>;

type CssVariableEntry = [name: string, value: string];
type PlainRecord = Record<string, unknown>;

function isPlainRecord(value: unknown): value is PlainRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function formatPath(path: string[]): string {
  return path.length === 0 ? '<root>' : path.join('.');
}

function flattenThemeToEntries(
  value: unknown,
  path: string[],
  entries: CssVariableEntry[]
): void {
  if (typeof value === 'string' || typeof value === 'number') {
    entries.push([`--prism-${path.map(toKebabCase).join('-')}`, String(value)]);
    return;
  }

  if (!isPlainRecord(value)) {
    throw new Error(
      `Cannot resolve CSS variables from ${formatPath(path)}. Expected an object, string, or number.`
    );
  }

  for (const key of Object.keys(value).sort((left, right) => left.localeCompare(right))) {
    flattenThemeToEntries(value[key], [...path, key], entries);
  }
}

export function resolveCssVariables(effectiveTheme: PrismTheme): CssVariableMap {
  const entries: CssVariableEntry[] = [];
  flattenThemeToEntries(effectiveTheme, [], entries);
  return Object.freeze(Object.fromEntries(entries));
}

export function cssVariablesToString(variables: CssVariableMap): string {
  const lines = Object.keys(variables)
    .sort((left, right) => left.localeCompare(right))
    .map((variableName) => `  ${variableName}: ${variables[variableName]};`);

  return [':root {', ...lines, '}'].join('\n');
}

export function resolveCssVariablesAsCss(effectiveTheme: PrismTheme): string {
  return cssVariablesToString(resolveCssVariables(effectiveTheme));
}
