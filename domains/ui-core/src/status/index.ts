export { componentStatusRegistry } from './component-status-registry.js';

export { createFileSystemRefResolver } from './create-file-system-ref-resolver.js';
export { createInMemoryRefResolver } from './create-in-memory-ref-resolver.js';

export { reportComponentStatuses } from './report-component-status.js';
export { resolveComponentStatuses } from './resolve-component-statuses.js';

export type {
  ComponentAccessibility,
  ComponentRegenerationAdvisory,
  ComponentStatus,
  ComponentStatusRefResolver,
  ComponentStatusRegistryEntry,
  ComponentVersion
} from './types.js';
