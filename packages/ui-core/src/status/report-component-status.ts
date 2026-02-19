import { stableHash } from '../determinism/stable-hash.js';

import type {
  ComponentAccessibility,
  ComponentStatus,
  ComponentStatusRefResolver,
  ComponentStatusRegistryEntry
} from './types.js';

const MISSING_HASH = 'missing';

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function resolveReferenceContent(
  ref: string,
  refKind: 'blueprint' | 'artifact' | 'generator',
  resolver: ComponentStatusRefResolver,
  flags: string[]
): string | undefined {
  if (!ref) {
    flags.push(`missing-${refKind}-ref`);
    return undefined;
  }

  const content = resolver.read(ref);

  if (typeof content !== 'string') {
    flags.push(`missing-${refKind}-file`);
    return undefined;
  }

  return content;
}

function resolveGeneratorHash(entry: ComponentStatusRegistryEntry, generatorContent: string | undefined): string {
  const identityInput = entry.generatorIdentityInput;

  if (typeof generatorContent === 'string') {
    const source = identityInput ? `${identityInput}\n${generatorContent}` : generatorContent;
    return stableHash(source);
  }

  if (typeof identityInput === 'string' && identityInput.length > 0) {
    return stableHash(identityInput);
  }

  return MISSING_HASH;
}

function resolveAccessibility(accessibility: ComponentAccessibility | undefined): ComponentAccessibility {
  if (!accessibility) {
    return { conformance: 'unknown' };
  }

  const next: ComponentAccessibility = {
    conformance: accessibility.conformance
  };

  if (Array.isArray(accessibility.notes) && accessibility.notes.length > 0) {
    next.notes = [...accessibility.notes];
  }

  if (typeof accessibility.lastEvaluatedRef === 'string' && accessibility.lastEvaluatedRef.length > 0) {
    next.lastEvaluatedRef = accessibility.lastEvaluatedRef;
  }

  return next;
}

export interface ReportComponentStatusesOptions {
  registry: readonly ComponentStatusRegistryEntry[];
  resolver: ComponentStatusRefResolver;
}

export function reportComponentStatuses(options: ReportComponentStatusesOptions): readonly ComponentStatus[] {
  return [...options.registry]
    .sort((left, right) => left.componentId.localeCompare(right.componentId))
    .map((entry) => {
      const flags = [...(entry.statusFlags ?? [])];
      const blueprintContent = resolveReferenceContent(
        entry.blueprintRef,
        'blueprint',
        options.resolver,
        flags
      );
      const artifactContent = resolveReferenceContent(
        entry.artifactRef,
        'artifact',
        options.resolver,
        flags
      );
      const generatorContent = resolveReferenceContent(
        entry.generatorRef,
        'generator',
        options.resolver,
        flags
      );
      const blueprintHash = typeof blueprintContent === 'string' ? stableHash(blueprintContent) : MISSING_HASH;
      const artifactHash = typeof artifactContent === 'string' ? stableHash(artifactContent) : MISSING_HASH;
      const generatorHash = resolveGeneratorHash(entry, generatorContent);

      const regenerationState = entry.mayRegenerate
        ? {
            mayRegenerate: true as const,
            regenerationAdvisory: {
              level: entry.regenerationAdvisory.level,
              notes: [...entry.regenerationAdvisory.notes]
            }
          }
        : {
            mayRegenerate: false as const
          };

      const status: ComponentStatus = {
        componentId: entry.componentId,
        blueprintRef: entry.blueprintRef,
        artifactRef: entry.artifactRef,
        blueprintHash,
        artifactHash,
        generatorRef: entry.generatorRef,
        generatorHash,
        version: entry.version ?? 'dev',
        accessibility: resolveAccessibility(entry.accessibility),
        ...regenerationState
      }

      const dedupedFlags = sortedUnique(flags);
      if (dedupedFlags.length > 0) {
        status.statusFlags = dedupedFlags;
      }

      return status;
    });
}
