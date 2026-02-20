import { describe, expect, it } from 'vitest';

import { componentBlueprints } from '../../blueprint/components/index.js';
import { prismCoreThemeTokens } from '../../prism-tokens.js';
import { generateComponentArtifacts } from '../generate-components.js';

describe('generateComponentArtifacts', () => {
  it('is deterministic for repeated calls with identical blueprints', () => {
    const first = JSON.stringify(generateComponentArtifacts(componentBlueprints));
    const second = JSON.stringify(generateComponentArtifacts(componentBlueprints));

    expect(second).toBe(first);
  });

  it('emits artifacts for the Phase 2 component set', () => {
    const componentIds = generateComponentArtifacts(componentBlueprints).map((artifact) => artifact.componentId);

    expect(componentIds).toEqual(['button', 'icon-button', 'surface', 'typography']);
  });

  it('binds generated component source to --prism theme variables', () => {
    const buttonArtifact = generateComponentArtifacts(componentBlueprints).find(
      (artifact) => artifact.componentId === 'button'
    );

    expect(buttonArtifact?.source.includes('--prism-color-primary')).toBe(true);
  });

  it('constrains typography blueprint variant and size enums to the theme contract keys', () => {
    const typographyBlueprint = componentBlueprints.find((blueprint) => blueprint.componentId === 'typography');

    const variantValues = typographyBlueprint?.attributes.find((attribute) => attribute.name === 'variant')?.enumValues;
    const sizeValues = typographyBlueprint?.attributes.find((attribute) => attribute.name === 'size')?.enumValues;

    const actual = JSON.stringify({ variantValues, sizeValues });
    const expected = JSON.stringify({
      variantValues: Object.keys(prismCoreThemeTokens.typography),
      sizeValues: Object.keys(prismCoreThemeTokens.typography.body)
    });

    expect(actual).toBe(expected);
  });
});
