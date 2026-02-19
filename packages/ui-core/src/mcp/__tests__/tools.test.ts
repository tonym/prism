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
  it('lists the locked v1 tool names in deterministic order', () => {
    expect(toolDefinitionsV1().map((entry) => entry.name)).toEqual([
      'getStatus',
      'listComponents',
      'getComponentArtifact',
      'getBaseTheme',
      'getBaseFonts',
      'listBaseFontFiles',
      'getBaseFontFile'
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

    expect(code).toBe('VERSION_NOT_FOUND');
  });

  it('getBaseTheme returns the base theme css artifact metadata', () => {
    const result = createHandlers().getBaseTheme(undefined);
    const contentType = result.ok ? result.data.artifact.contentType : null;

    expect(contentType).toBe('text/css');
  });

  it('getBaseFonts returns css with font-face declarations', () => {
    const result = createHandlers().getBaseFonts(undefined);
    const includesFontFace = result.ok ? result.data.artifact.content.includes('@font-face') : false;

    expect(includesFontFace).toBe(true);
  });

  it('listBaseFontFiles returns stable file ids', () => {
    const result = createHandlers().listBaseFontFiles(undefined);
    const fileIds = result.ok ? result.data.files.map((entry) => entry.fileId) : [];

    expect(fileIds).toEqual(['prism-public-sans-400.woff2', 'prism-public-sans-500.woff2']);
  });

  it('getBaseFontFile returns base64 encoded binary data', () => {
    const result = createHandlers().getBaseFontFile({ fileId: 'prism-public-sans-400.woff2' });
    const encoding = result.ok ? result.data.artifact.encoding : null;

    expect(encoding).toBe('base64');
  });
});
