import { componentBlueprints } from '../blueprint/components/index.js';
import { stableSerialize } from '../determinism/stable-serialize.js';
import { componentGeneratorIdentity } from '../generator/generator-identity.js';
import {
  artifactRefForComponent,
  blueprintRefForComponent,
  componentGeneratorRef
} from '../generator/refs.js';
import type { ComponentStatusRegistryEntry } from './types.js';

const generatorIdentityInput = stableSerialize(componentGeneratorIdentity);

const registryOverrides: Record<string, Partial<ComponentStatusRegistryEntry>> = {
  'icon-button': {
    accessibility: {
      conformance: 'partial',
      notes: ['Requires aria-label or readable fallback text for icon-only usage.']
    },
    mayRegenerate: true,
    regenerationAdvisory: {
      level: 'caution',
      notes: ['Verify icon-only accessible naming before accepting regenerated output.']
    }
  },
  button: {
    accessibility: {
      conformance: 'unknown'
    }
  },
  surface: {
    accessibility: {
      conformance: 'unknown'
    }
  },
  typography: {
    accessibility: {
      conformance: 'unknown'
    }
  }
};

export const componentStatusRegistry: readonly ComponentStatusRegistryEntry[] = Object.freeze(
  [...componentBlueprints]
    .sort((left, right) => left.componentId.localeCompare(right.componentId))
    .map((blueprint) => {
      const override = registryOverrides[blueprint.componentId] ?? {};

      return {
        componentId: blueprint.componentId,
        blueprintRef: blueprintRefForComponent(blueprint.componentId),
        artifactRef: artifactRefForComponent(blueprint.componentId),
        generatorRef: componentGeneratorRef,
        generatorIdentityInput,
        version: 'dev',
        ...override
      } satisfies ComponentStatusRegistryEntry;
    })
);
