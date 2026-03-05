import { describe, expect, it } from 'vitest';

import { parseNextMcpFrame } from '../lib/mcp-stdio-client.js';

function buildFrame(message: object): Buffer {
  return Buffer.from(`${JSON.stringify(message)}\n`, 'utf8');
}

describe('parseNextMcpFrame', () => {
  it('parses a frame whose JSON body includes multibyte characters', () => {
    const frame = buildFrame({
      jsonrpc: '2.0',
      id: 1,
      result: {
        instructions: 'Design tokens 🎨 with emoji'
      }
    });

    const parsed = parseNextMcpFrame(frame);

    expect(parsed?.message).toEqual({
      jsonrpc: '2.0',
      id: 1,
      result: {
        instructions: 'Design tokens 🎨 with emoji'
      }
    });
  });

  it('returns null when frame body is incomplete', () => {
    const frame = buildFrame({
      jsonrpc: '2.0',
      id: 2,
      result: {
        ok: true
      }
    });

    const parsed = parseNextMcpFrame(frame.subarray(0, frame.length - 1));

    expect(parsed).toBeNull();
  });

  it('returns remaining bytes when multiple frames are concatenated', () => {
    const first = buildFrame({
      jsonrpc: '2.0',
      id: 3,
      result: {
        message: 'first'
      }
    });
    const second = buildFrame({
      jsonrpc: '2.0',
      id: 4,
      result: {
        message: 'second'
      }
    });

    const combined = Buffer.concat([first, second]);
    const parsed = parseNextMcpFrame(combined);

    expect(parsed?.remaining.equals(second)).toBe(true);
  });
});
