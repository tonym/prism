import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { ComponentStatusRefResolver } from './types.js';

export function createFileSystemRefResolver(rootDirectory: string): ComponentStatusRefResolver {
  return {
    read(ref: string): string | undefined {
      const absolutePath = path.join(rootDirectory, ref);

      try {
        return readFileSync(absolutePath, 'utf8');
      } catch {
        return undefined;
      }
    }
  };
}
