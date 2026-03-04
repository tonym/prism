import { describe, expect, it } from 'vitest';

import { suggestRepoTokenKeys } from '../lib/figma-name-mapping.js';

describe('suggestRepoTokenKeys', () => {
  it('returns high confidence for exact slug matches', () => {
    const result = suggestRepoTokenKeys('prism-color-on-primary', [
      'color.primary',
      'color.onPrimary',
      'typography.body.medium.fontSize'
    ]);

    expect(result).toEqual({
      confidence: 'high',
      variableSlug: 'color-on-primary',
      candidates: [
        {
          repoTokenKey: 'color.onPrimary',
          score: 1,
          reason: 'exact_slug_match'
        }
      ]
    });
  });

  it('returns medium confidence for ambiguous exact slug matches', () => {
    const result = suggestRepoTokenKeys('prism-color-on-primary', [
      'color.onPrimary',
      'color.on-primary'
    ]);

    expect(result.confidence).toBe('medium');
  });

  it('returns low confidence with no candidates when no match exists', () => {
    const result = suggestRepoTokenKeys('prism-unknown-token', [
      'color.primary',
      'typography.body.medium.fontSize'
    ]);

    expect(result).toEqual({
      confidence: 'low',
      variableSlug: 'unknown-token',
      candidates: []
    });
  });
});
