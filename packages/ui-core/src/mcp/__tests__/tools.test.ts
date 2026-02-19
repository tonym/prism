import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { UiCoreArtifactStore } from '../artifact-store.js';
import { createToolHandlersV1, toolDefinitionsV1 } from '../tools.js';

function resolveUiCoreRootForTests(): string {
  const cwd = process.cwd();
  return cwd.endsWith('/packages/ui-core') ? cwd : path.join(cwd, 'packages/ui-core');
}

function createHandlers() {
  const store = new UiCoreArtifactStore(resolveUiCoreRootForTests());
  return createToolHandlersV1(store);
}

describe('ui-core mcp tools v1 (milestone 1)', () => {
  it('lists only the initial locked tool names for milestone 1', () => {
    expect(toolDefinitionsV1().map((entry) => entry.name)).toEqual([
      'getStatus',
      'listComponents',
      'getComponentArtifact'
    ]);
  });

  it('getStatus returns componentIds in sorted order', () => {
    const result = createHandlers().getStatus(undefined);
    const componentIds = result.ok ? result.data.available.components : [];

    expect(componentIds).toEqual(['button', 'icon-button', 'surface', 'typography']);
  });

  it('listComponents exposes the button tag mapping', () => {
    const result = createHandlers().listComponents(undefined);
    const buttonTag = result.ok
      ? result.data.components.find((entry) => entry.componentId === 'button')?.tagName
      : null;

    expect(buttonTag).toBe('prism-button');
  });

  it('getComponentArtifact returns JavaScript content for button', () => {
    const result = createHandlers().getComponentArtifact({ componentId: 'button' });
    const contentType = result.ok ? result.data.artifact.contentType : null;

    expect(contentType).toBe('text/javascript');
  });

  it('getComponentArtifact returns a structured error for unknown components', () => {
    const result = createHandlers().getComponentArtifact({ componentId: 'does-not-exist' });
    const code = !result.ok ? result.error.code : null;

    expect(code).toBe('COMPONENT_NOT_FOUND');
  });

  it('listComponents rejects unsupported versions deterministically', () => {
    const result = createHandlers().listComponents({ version: 'latest' });
    const code = !result.ok ? result.error.code : null;

    expect(code).toBe('INTERNAL_ERROR');
  });
});
