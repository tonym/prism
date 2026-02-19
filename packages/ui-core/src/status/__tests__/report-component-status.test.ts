import { describe, expect, it } from 'vitest';

import { createInMemoryRefResolver } from '../create-in-memory-ref-resolver.js';
import { reportComponentStatuses } from '../report-component-status.js';
import type { ComponentStatusRegistryEntry } from '../types.js';

describe('reportComponentStatuses', () => {
  const baseRegistry: readonly ComponentStatusRegistryEntry[] = [
    {
      componentId: 'button',
      blueprintRef: 'src/blueprint/components/button.blueprint.ts',
      artifactRef: 'src/generated/components/prism-button.component.js',
      generatorRef: 'src/generator/generate-components.ts',
      version: 'dev'
    }
  ];

  const baseResolver = createInMemoryRefResolver({
    'src/blueprint/components/button.blueprint.ts': 'blueprint:button',
    'src/generated/components/prism-button.component.js': 'artifact:button',
    'src/generator/generate-components.ts': 'generator:v1'
  });

  it('is deterministic for repeated status reporting calls', () => {
    const first = JSON.stringify(reportComponentStatuses({ registry: baseRegistry, resolver: baseResolver }));
    const second = JSON.stringify(reportComponentStatuses({ registry: baseRegistry, resolver: baseResolver }));

    expect(second).toBe(first);
  });

  it('reports factual missing-ref and missing-file flags instead of throwing', () => {
    const registry: readonly ComponentStatusRegistryEntry[] = [
      {
        componentId: 'missing',
        blueprintRef: '',
        artifactRef: 'artifact-does-not-exist',
        generatorRef: 'generator-does-not-exist'
      }
    ];

    const result = reportComponentStatuses({
      registry,
      resolver: createInMemoryRefResolver({})
    });

    expect(result[0]?.statusFlags).toEqual([
      'missing-artifact-file',
      'missing-blueprint-ref',
      'missing-generator-file'
    ]);
  });

  it('defaults mayRegenerate to false when not provided by registry', () => {
    const result = reportComponentStatuses({ registry: baseRegistry, resolver: baseResolver });

    expect(result[0]?.mayRegenerate).toBe(false);
  });

  it('retains regenerationAdvisory when mayRegenerate is true', () => {
    const registry: readonly ComponentStatusRegistryEntry[] = [
      {
        componentId: 'regen-enabled',
        blueprintRef: 'blueprint-ref',
        artifactRef: 'artifact-ref',
        generatorRef: 'generator-ref',
        mayRegenerate: true,
        regenerationAdvisory: {
          level: 'caution',
          notes: ['Review generated output before acceptance.']
        }
      }
    ];

    const resolver = createInMemoryRefResolver({
      'blueprint-ref': 'blueprint',
      'artifact-ref': 'artifact',
      'generator-ref': 'generator'
    });

    const result = reportComponentStatuses({ registry, resolver });

    expect(result[0]?.regenerationAdvisory?.level).toBe('caution');
  });

  it('defaults accessibility conformance to unknown when omitted', () => {
    const result = reportComponentStatuses({ registry: baseRegistry, resolver: baseResolver });

    expect(result[0]?.accessibility.conformance).toBe('unknown');
  });
});
