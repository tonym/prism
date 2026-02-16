export {
  prismCoreThemeTokens,
  prismDefaultThemeTokens,
  prismOverlayThemeTokens,
  prismTokens
} from './prism-tokens.js';

export { resolveCssVariables, cssVariablesToString, resolveCssVariablesAsCss } from './css/resolve-css-variables.js';

export { coreTheme, defaultTheme, overlayTheme } from './theme/layers.js';
export { mergeTheme } from './theme/merge-theme.js';

export type {
  CssVariableMap
} from './css/resolve-css-variables.js';

export type {
  DeepPartial,
  PrismColorRoles,
  PrismElevationScale,
  PrismShapeScale,
  PrismTheme,
  PrismTypographyEntry,
  PrismTypographyScale,
  PrismTypographySizeScale,
  ThemeOverride
} from './theme/types.js';
