import { componentBlueprints } from '../blueprint/components/index.js';
import { stableSerialize } from '../determinism/stable-serialize.js';
import { componentGeneratorIdentity } from '../generator/generator-identity.js';
import {
  artifactRefForComponent,
  blueprintRefForComponent,
  componentGeneratorRef
} from '../generator/refs.js';
import type {
  ComponentAccessibility,
  ComponentRegenerationAdvisory,
  ComponentStatusRegistryEntry,
  ComponentVersion
} from './types.js';

const generatorIdentityInput = stableSerialize(componentGeneratorIdentity);

interface RegistryOverrideBase {
  accessibility?: ComponentAccessibility;
  statusFlags?: string[];
  version?: ComponentVersion;
}

type RegistryOverride =
  RegistryOverrideBase &
    (
      | {
          mayRegenerate: true;
          regenerationAdvisory: ComponentRegenerationAdvisory;
        }
      | {
          mayRegenerate?: false;
          regenerationAdvisory?: never;
        }
    );

const registryOverrides: Record<string, RegistryOverride> = {
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

      const baseEntry = {
        componentId: blueprint.componentId,
        blueprintRef: blueprintRefForComponent(blueprint.componentId),
        artifactRef: artifactRefForComponent(blueprint.componentId),
        generatorRef: componentGeneratorRef,
        generatorIdentityInput,
        version: override.version ?? 'dev',
        accessibility: override.accessibility,
        statusFlags: override.statusFlags
      };

      if (override.mayRegenerate) {
        return {
          ...baseEntry,
          mayRegenerate: true,
          regenerationAdvisory: {
            level: override.regenerationAdvisory.level,
            notes: [...override.regenerationAdvisory.notes]
          }
        } satisfies ComponentStatusRegistryEntry;
      }

      return {
        ...baseEntry
      } satisfies ComponentStatusRegistryEntry;
    })
);
