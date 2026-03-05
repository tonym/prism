import { describe, expect, it } from 'vitest';

import { parseEnvText } from '../lib/env-file.js';

describe('parseEnvText', () => {
  it('parses quoted and unquoted key-value pairs', () => {
    const parsed = parseEnvText(
      [
        '# comment',
        'FIGMA_ACCESS_TOKEN=figd_token_value',
        'PRISM_FIGMA_ACCESS_TOKEN="figd_override"',
        "EMPTY=''",
        'export ENABLE_FEATURE=true'
      ].join('\n')
    );

    expect(parsed).toEqual({
      FIGMA_ACCESS_TOKEN: 'figd_token_value',
      PRISM_FIGMA_ACCESS_TOKEN: 'figd_override',
      EMPTY: '',
      ENABLE_FEATURE: 'true'
    });
  });

  it('ignores invalid lines and inline comments outside quotes', () => {
    const parsed = parseEnvText(
      [
        'NOT_A_PAIR',
        '1INVALID=value',
        'FIGMA_ACCESS_TOKEN=figd_value # comment',
        'QUOTED="value # keep"',
        "SINGLE='value # keep too'"
      ].join('\n')
    );

    expect(parsed).toEqual({
      FIGMA_ACCESS_TOKEN: 'figd_value',
      QUOTED: 'value # keep',
      SINGLE: 'value # keep too'
    });
  });
});
