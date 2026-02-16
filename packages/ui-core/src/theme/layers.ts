import {
  prismCoreThemeTokens,
  prismDefaultThemeTokens,
  prismOverlayThemeTokens
} from '../prism-tokens.js';
import type { PrismTheme, ThemeOverride } from './types.js';

export const coreTheme: PrismTheme = prismCoreThemeTokens;
export const defaultTheme: ThemeOverride = prismDefaultThemeTokens;
export const overlayTheme: ThemeOverride = prismOverlayThemeTokens;
