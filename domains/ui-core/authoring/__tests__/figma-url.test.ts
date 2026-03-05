import { describe, expect, it } from 'vitest';

import { extractFigmaFileKey, validateFigmaFileUrl } from '../lib/figma-url.js';

describe('validateFigmaFileUrl', () => {
  it('accepts a valid figma design url', () => {
    const result = validateFigmaFileUrl(
      'https://www.figma.com/design/e97H7PUAqbH0q7Ltb4GuX1/Prism-components?node-id=2-128'
    );

    expect(result).toBe('https://www.figma.com/design/e97H7PUAqbH0q7Ltb4GuX1/Prism-components');
  });

  it('rejects malformed path that is not /design/<fileKey>/<fileName>', () => {
    const action = () =>
      validateFigmaFileUrl('https://www.figma.com/desige97H7PUAqbH0q7Ltb4GuX1/Prism-components?node-id=2-128');

    expect(action).toThrow('Expected format: /design/<fileKey>/<fileName>.');
  });

  it('rejects non-figma hosts', () => {
    const action = () => validateFigmaFileUrl('https://example.com/design/file/name');

    expect(action).toThrow('Unsupported Figma host');
  });

  it('extracts file key from valid figma url', () => {
    const fileKey = extractFigmaFileKey(
      'https://www.figma.com/design/e97H7PUAqbH0q7Ltb4GuX1/Prism-components?node-id=2-128'
    );

    expect(fileKey).toBe('e97H7PUAqbH0q7Ltb4GuX1');
  });
});
