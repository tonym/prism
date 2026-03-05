import { describe, expect, it } from 'vitest';

import { assertNoStructuralErrors, buildAlignmentReport } from '../lib/map-check.js';

const snapshotFixture = {
  schemaVersion: 1,
  contentHash: 'abc',
  source: {
    transport: 'mcp',
    serverName: 'figma_console',
    toolName: 'figma_get_variables',
    collectionName: 'Prism UI Core Tokens'
  },
  collection: {
    id: 'collection-1',
    name: 'Prism UI Core Tokens',
    variables: [
      { id: 'var-1', name: 'prism-color-primary', resolvedType: 'COLOR' },
      { id: 'var-2', name: 'prism-color-on-primary', resolvedType: 'COLOR' }
    ]
  }
};

describe('buildAlignmentReport', () => {
  it('flags invalid repo token references as structural errors', () => {
    const report = buildAlignmentReport({
      snapshot: snapshotFixture,
      mapping: {
        schemaVersion: 1,
        collectionName: 'Prism UI Core Tokens',
        mappings: {
          'var-1': 'color.primary',
          'var-2': 'color.notARealToken'
        }
      },
      repoTokenKeys: ['color.primary', 'color.onPrimary']
    });

    expect(report.errors[0]?.code).toBe('INVALID_REPO_TOKEN_KEY_REFERENCE');
  });

  it('emits warnings for unmapped figma variables and unmapped repo token keys', () => {
    const report = buildAlignmentReport({
      snapshot: snapshotFixture,
      mapping: {
        schemaVersion: 1,
        collectionName: 'Prism UI Core Tokens',
        mappings: {
          'var-1': 'color.primary'
        }
      },
      repoTokenKeys: ['color.primary', 'color.onPrimary', 'shape.full']
    });

    expect(report.summary.warnings).toBe(2);
  });

  it('throws when structural errors are present', () => {
    const report = buildAlignmentReport({
      snapshot: snapshotFixture,
      mapping: {
        schemaVersion: 1,
        collectionName: 'Prism UI Core Tokens',
        mappings: {
          'var-1': 'color.primary',
          'var-2': 'color.notARealToken'
        }
      },
      repoTokenKeys: ['color.primary', 'color.onPrimary']
    });

    expect(() => assertNoStructuralErrors(report)).toThrow('Alignment check failed');
  });
});
