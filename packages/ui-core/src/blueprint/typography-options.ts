import { prismCoreThemeTokens } from '../prism-tokens.js';
import type { PrismTypographySize, PrismTypographyVariant } from '../theme/types.js';

export const prismTypographyVariants = Object.freeze(
  Object.keys(prismCoreThemeTokens.typography) as PrismTypographyVariant[]
);

export const prismTypographySizes = Object.freeze(
  Object.keys(prismCoreThemeTokens.typography.body) as PrismTypographySize[]
);
