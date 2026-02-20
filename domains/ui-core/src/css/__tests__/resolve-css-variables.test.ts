import { describe, expect, it } from 'vitest';

import { coreTheme } from '../../theme/layers.js';
import {
  cssVariablesToString,
  resolveCssVariables,
  resolveCssVariablesAsCss
} from '../resolve-css-variables.js';

describe('resolveCssVariables', () => {
  it('uses the --prism- prefix for generated variables', () => {
    const variables = resolveCssVariables(coreTheme);

    expect(variables['--prism-color-primary']).toBe(coreTheme.color.primary);
  });

  it('maps typography token paths to kebab-case variable names', () => {
    const variables = resolveCssVariables(coreTheme);

    expect(variables['--prism-typography-body-large-font-size']).toBe(
      coreTheme.typography.body.large.fontSize
    );
  });

  it('returns keys in deterministic sorted order', () => {
    const variables = resolveCssVariables(coreTheme);
    const keys = Object.keys(variables);
    const sortedKeys = [...keys].sort((left, right) => left.localeCompare(right));

    expect(keys).toEqual(sortedKeys);
  });

  it('is deterministic across repeated resolution calls', () => {
    const first = resolveCssVariables(coreTheme);
    const second = resolveCssVariables(coreTheme);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

describe('css variable string output', () => {
  it('renders a root block string', () => {
    const css = resolveCssVariablesAsCss(coreTheme);

    expect(css.startsWith(':root {\n  --prism-')).toBe(true);
  });

  it('renders variable lines in sorted order', () => {
    const css = cssVariablesToString(resolveCssVariables(coreTheme));
    const lines = css.split('\n').slice(1, -1);
    const variableNames = lines.map((line) => line.trim().split(':')[0]);
    const sortedVariableNames = [...variableNames].sort();

    expect(variableNames).toEqual(sortedVariableNames);
  });
});
