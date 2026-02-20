import { describe, expect, it } from 'vitest';

import { coreTheme } from '../layers.js';
import { mergeTheme } from '../merge-theme.js';
import type { PrismTheme, ThemeOverride } from '../types.js';

describe('mergeTheme', () => {
  it('applies overlay values over default and core values', () => {
    const merged = mergeTheme(
      coreTheme,
      { color: { primary: '#1155AA' } },
      { color: { primary: '#AA2211' } }
    );

    expect(merged.color.primary).toBe('#AA2211');
  });

  it('deep merges nested objects without replacing sibling values', () => {
    const merged = mergeTheme(
      coreTheme,
      { typography: { body: { large: { fontSize: '1.125rem' } } } },
      {}
    );

    expect(merged.typography.body.large.lineHeight).toBe(coreTheme.typography.body.large.lineHeight);
  });

  it('rejects unknown keys in overlayTheme', () => {
    const invalidOverlay = {
      color: {
        primary: '#003366',
        unknownRole: '#111111'
      }
    } as unknown as ThemeOverride;

    expect(() => mergeTheme(coreTheme, {}, invalidOverlay)).toThrowError(
      /Unknown key in overlayTheme at color.unknownRole./
    );
  });

  it('rejects structural replacement for nested objects', () => {
    const invalidDefault = {
      typography: {
        body: 'invalid'
      }
    } as unknown as ThemeOverride;

    expect(() => mergeTheme(coreTheme, invalidDefault, {})).toThrowError(
      /Type mismatch in defaultTheme at typography.body. Expected object/
    );
  });

  it('preserves the complete key structure after merge', () => {
    const merged = mergeTheme(coreTheme, { color: { primary: '#0F5ACC' } }, {});

    expect(Object.keys(merged.color).length).toBe(Object.keys(coreTheme.color).length);
  });

  it('rejects missing keys in coreTheme', () => {
    const { primary: _removed, ...missingPrimaryColor } = coreTheme.color;
    const invalidCore = { ...coreTheme, color: missingPrimaryColor } as unknown as PrismTheme;

    expect(() => mergeTheme(invalidCore, {}, {})).toThrowError(
      /Missing key in coreTheme at color.primary./
    );
  });

  it('does not mutate merge inputs', () => {
    const localCore = JSON.parse(JSON.stringify(coreTheme)) as PrismTheme;
    const defaultTheme: ThemeOverride = { color: { secondary: '#006A60' } };
    const overlayTheme: ThemeOverride = {
      typography: { label: { medium: { letterSpacing: '0.0625rem' } } }
    };
    const before = JSON.stringify({ localCore, defaultTheme, overlayTheme });

    mergeTheme(localCore, defaultTheme, overlayTheme);

    const after = JSON.stringify({ localCore, defaultTheme, overlayTheme });
    expect(after).toBe(before);
  });

  it('returns deterministic output for repeated calls', () => {
    const defaultTheme: ThemeOverride = {
      color: { primaryContainer: '#D0E1FF', tertiaryContainer: '#E5DFFF' }
    };
    const overlayTheme: ThemeOverride = { elevation: { level3: '6' } };

    const first = mergeTheme(coreTheme, defaultTheme, overlayTheme);
    const second = mergeTheme(coreTheme, defaultTheme, overlayTheme);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});
