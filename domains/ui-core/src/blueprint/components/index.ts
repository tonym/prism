import type { ComponentBlueprint } from '../component-blueprint.js';

import { buttonBlueprint } from './button.blueprint.js';
import { iconButtonBlueprint } from './icon-button.blueprint.js';
import { surfaceBlueprint } from './surface.blueprint.js';
import { typographyBlueprint } from './typography.blueprint.js';

export {
  buttonBlueprint,
  iconButtonBlueprint,
  surfaceBlueprint,
  typographyBlueprint
};

export const componentBlueprints: readonly ComponentBlueprint[] = Object.freeze(
  [buttonBlueprint, iconButtonBlueprint, typographyBlueprint, surfaceBlueprint].sort((left, right) =>
    left.componentId.localeCompare(right.componentId)
  )
);
