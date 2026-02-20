import { componentStatusRegistry } from './component-status-registry.js';
import { createFileSystemRefResolver } from './create-file-system-ref-resolver.js';
import { reportComponentStatuses } from './report-component-status.js';

export function resolveComponentStatuses(rootDirectory: string = process.cwd()) {
  return reportComponentStatuses({
    registry: componentStatusRegistry,
    resolver: createFileSystemRefResolver(rootDirectory)
  });
}
