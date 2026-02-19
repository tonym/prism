import type { ComponentStatusRefResolver } from './types.js';

export function createInMemoryRefResolver(contentsByRef: Readonly<Record<string, string>>): ComponentStatusRefResolver {
  return {
    read(ref: string): string | undefined {
      return contentsByRef[ref];
    }
  };
}
