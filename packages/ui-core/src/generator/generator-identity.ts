import { stableHash } from '../determinism/stable-hash.js';
import { stableSerialize } from '../determinism/stable-serialize.js';

export const componentGeneratorIdentity = Object.freeze({
  name: '@prism/ui-core/web-component-generator',
  contract: 'phase-2',
  version: '1'
});

export function resolveComponentGeneratorHash(): string {
  return stableHash(stableSerialize(componentGeneratorIdentity));
}
