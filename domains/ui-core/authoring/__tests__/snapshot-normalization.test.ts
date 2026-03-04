import { describe, expect, it } from 'vitest';

import { buildNormalizedSnapshot } from '../lib/snapshot-schema.js';
import { stableStringify } from '../lib/stable-json.js';

describe('buildNormalizedSnapshot', () => {
  it('produces byte-stable output for equivalent payloads with different ordering', () => {
    const payloadA = {
      data: {
        collections: [
          {
            id: 'collection-1',
            name: 'Prism UI Core Tokens',
            defaultModeId: 'mode-b',
            timestamp: 'volatile',
            sessionId: 'volatile',
            modes: [
              { id: 'mode-b', name: 'Dark' },
              { id: 'mode-a', name: 'Light' }
            ],
            variables: [
              {
                id: 'var-2',
                name: 'prism-color-primary',
                resolvedType: 'COLOR',
                valuesByMode: {
                  'mode-b': '#111111',
                  'mode-a': '#0057D9'
                }
              },
              {
                id: 'var-1',
                name: 'prism-color-on-primary',
                resolvedType: 'COLOR',
                valuesByMode: {
                  'mode-b': '#eeeeee',
                  'mode-a': '#FFFFFF'
                }
              }
            ]
          }
        ]
      }
    };

    const payloadB = {
      data: {
        collections: [
          {
            id: 'collection-1',
            name: 'Prism UI Core Tokens',
            defaultModeId: 'mode-b',
            timestamp: 'different-volatile-value',
            sessionId: 'different-volatile-value',
            modes: [
              { id: 'mode-a', name: 'Light' },
              { id: 'mode-b', name: 'Dark' }
            ],
            variables: [
              {
                id: 'var-1',
                name: 'prism-color-on-primary',
                resolvedType: 'COLOR',
                valuesByMode: {
                  'mode-a': '#FFFFFF',
                  'mode-b': '#eeeeee'
                }
              },
              {
                id: 'var-2',
                name: 'prism-color-primary',
                resolvedType: 'COLOR',
                valuesByMode: {
                  'mode-a': '#0057D9',
                  'mode-b': '#111111'
                }
              }
            ]
          }
        ]
      }
    };

    const first = stableStringify(buildNormalizedSnapshot(payloadA));
    const second = stableStringify(buildNormalizedSnapshot(payloadB));

    expect(first).toBe(second);
  });

  it('strips volatile fields from normalized snapshot content', () => {
    const payload = {
      data: {
        collections: [
          {
            id: 'collection-1',
            name: 'Prism UI Core Tokens',
            defaultModeId: 'mode-a',
            timestamp: 'volatile',
            sessionId: 'volatile',
            modes: [{ id: 'mode-a', name: 'Default' }],
            variables: [
              {
                id: 'var-1',
                name: 'prism-color-primary',
                resolvedType: 'COLOR',
                valuesByMode: { 'mode-a': '#0057D9' },
                updatedAt: 'volatile'
              }
            ]
          }
        ]
      }
    };

    const serialized = JSON.stringify(buildNormalizedSnapshot(payload));

    expect(serialized.includes('timestamp')).toBe(false);
  });
});
