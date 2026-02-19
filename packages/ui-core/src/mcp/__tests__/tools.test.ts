import { describe, expect, it } from 'vitest';

import { UiCoreArtifactStore } from '../artifact-store.js';
import { createToolHandlersV1, toolDefinitionsV1 } from '../tools.js';
import type { ToolHandler } from '../tools.js';
import type { JsonObject, JsonValue, ToolResult } from '../types.js';

function resolveUiCoreRootForTests(): string {
  const runtime = globalThis as unknown as {
    process?: {
      cwd?: () => string;
    };
  };
  const cwd = runtime.process?.cwd?.() ?? '';
  return cwd.endsWith('/packages/ui-core') ? cwd : `${cwd}/packages/ui-core`;
}

function createHandlers() {
  const store = new UiCoreArtifactStore(resolveUiCoreRootForTests());
  return createToolHandlersV1(store);
}

function getTool(name: string): ToolHandler {
  const tool = createHandlers()[name];

  if (!tool) {
    throw new Error(`Missing tool "${name}" in locked v1 surface.`);
  }

  return tool;
}

function requireSuccess(result: ToolResult): JsonObject {
  if (!result.ok) {
    throw new Error(`Expected success, received ${result.error.code}: ${result.error.message}`);
  }

  return result.data;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireObject(value: unknown, label: string): JsonObject {
  if (!isJsonObject(value)) {
    throw new Error(`${label} must be an object.`);
  }

  return value;
}

function requireArray(value: JsonValue | undefined, label: string): readonly JsonValue[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array.`);
  }

  return value;
}

function requireString(value: JsonValue | undefined, label: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${label} must be a string.`);
  }

  return value;
}

describe('ui-core mcp tools v1', () => {
  it('lists the locked v1 tool names in deterministic order', () => {
    expect(toolDefinitionsV1().map((entry) => entry.name)).toEqual([
      'getStatus',
      'listComponents',
      'getComponentArtifact',
      'getBaseTheme',
      'getBaseFonts',
      'listBaseFontFiles',
      'getBaseFontFile',
      'listBlueprints',
      'getBlueprint'
    ]);
  });

  it('getStatus returns componentIds in sorted order', () => {
    const result = getTool('getStatus')(undefined);
    const data = requireSuccess(result);
    const available = requireObject(data.available, 'available');
    const componentIds = requireArray(available.components, 'available.components')
      .map((entry) => requireString(entry, 'componentId'));

    expect(componentIds).toEqual(['button', 'icon-button', 'surface', 'typography']);
  });

  it('listComponents exposes the button tag mapping', () => {
    const result = getTool('listComponents')(undefined);
    const data = requireSuccess(result);
    const components = requireArray(data.components, 'components');
    const buttonTag = components
      .map((entry) => requireObject(entry, 'component'))
      .find((entry) => requireString(entry.componentId, 'componentId') === 'button')
      ?.tagName;

    expect(buttonTag).toBe('prism-button');
  });

  it('getComponentArtifact returns JavaScript content for button', () => {
    const result = getTool('getComponentArtifact')({ componentId: 'button' });
    const data = requireSuccess(result);
    const artifact = requireObject(data.artifact, 'artifact');
    const contentType = requireString(artifact.contentType, 'artifact.contentType');

    expect(contentType).toBe('text/javascript');
  });

  it('getComponentArtifact returns a structured error for unknown components', () => {
    const result = getTool('getComponentArtifact')({ componentId: 'does-not-exist' });
    const code = !result.ok ? result.error.code : null;

    expect(code).toBe('COMPONENT_NOT_FOUND');
  });

  it('listComponents rejects unsupported versions deterministically', () => {
    const result = getTool('listComponents')({ version: 'latest' });
    const code = !result.ok ? result.error.code : null;

    expect(code).toBe('VERSION_NOT_FOUND');
  });

  it('getBaseTheme returns the base theme css artifact metadata', () => {
    const result = getTool('getBaseTheme')(undefined);
    const data = requireSuccess(result);
    const artifact = requireObject(data.artifact, 'artifact');
    const contentType = requireString(artifact.contentType, 'artifact.contentType');

    expect(contentType).toBe('text/css');
  });

  it('getBaseFonts returns css with font-face declarations', () => {
    const result = getTool('getBaseFonts')(undefined);
    const data = requireSuccess(result);
    const artifact = requireObject(data.artifact, 'artifact');
    const content = requireString(artifact.content, 'artifact.content');
    const includesFontFace = content.includes('@font-face');

    expect(includesFontFace).toBe(true);
  });

  it('listBaseFontFiles returns stable file ids', () => {
    const result = getTool('listBaseFontFiles')(undefined);
    const data = requireSuccess(result);
    const files = requireArray(data.files, 'files');
    const fileIds = files
      .map((entry) => requireObject(entry, 'file'))
      .map((entry) => requireString(entry.fileId, 'file.fileId'));

    expect(fileIds).toEqual(['prism-public-sans-400.woff2', 'prism-public-sans-500.woff2']);
  });

  it('getBaseFontFile returns base64 encoded binary data', () => {
    const result = getTool('getBaseFontFile')({ fileId: 'prism-public-sans-400.woff2' });
    const data = requireSuccess(result);
    const artifact = requireObject(data.artifact, 'artifact');
    const encoding = requireString(artifact.encoding, 'artifact.encoding');

    expect(encoding).toBe('base64');
  });

  it('listBlueprints returns component mapping metadata', () => {
    const result = getTool('listBlueprints')(undefined);
    const data = requireSuccess(result);
    const blueprints = requireArray(data.blueprints, 'blueprints');
    const buttonBlueprint = blueprints
      .map((entry) => requireObject(entry, 'blueprint'))
      .find((entry) => requireString(entry.componentId, 'blueprint.componentId') === 'button')
      ?.blueprintId;

    expect(buttonBlueprint).toBe('button.blueprint');
  });

  it('getBlueprint resolves by componentId', () => {
    const result = getTool('getBlueprint')({ componentId: 'button' });
    const data = requireSuccess(result);
    const blueprintId = requireString(data.blueprintId, 'blueprintId');

    expect(blueprintId).toBe('button.blueprint');
  });

  it('getBlueprint resolves by blueprintId', () => {
    const result = getTool('getBlueprint')({ blueprintId: 'typography.blueprint' });
    const data = requireSuccess(result);
    const componentId = requireString(data.componentId, 'componentId');

    expect(componentId).toBe('typography');
  });

  it('getBlueprint requires blueprintId or componentId', () => {
    const result = getTool('getBlueprint')({});
    const code = !result.ok ? result.error.code : null;

    expect(code).toBe('INVALID_INPUT');
  });
});
