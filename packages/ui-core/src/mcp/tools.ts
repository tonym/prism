import { componentBlueprints } from '../blueprint/components/index.js';
import { UiCoreArtifactStore } from './artifact-store.js';
import type { JsonObject, ToolErrorResult, ToolResult, ToolSuccessResult } from './types.js';
import { ToolError } from './types.js';

export type ToolHandler = (input: unknown) => ToolResult;

const TOOL_NAMES = Object.freeze({
  getStatus: 'getStatus',
  listComponents: 'listComponents',
  getComponentArtifact: 'getComponentArtifact',
  getBaseTheme: 'getBaseTheme',
  getBaseFonts: 'getBaseFonts',
  listBaseFontFiles: 'listBaseFontFiles',
  getBaseFontFile: 'getBaseFontFile',
  listBlueprints: 'listBlueprints',
  getBlueprint: 'getBlueprint'
});

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: JsonObject;
}

function success(data: JsonObject): ToolSuccessResult {
  return {
    ok: true,
    data
  };
}

function failure(error: ToolError): ToolErrorResult {
  return {
    ok: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    }
  };
}

function assertObject(value: unknown, fieldName: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ToolError('INVALID_INPUT', `${fieldName} must be an object.`);
  }

  return value as JsonObject;
}

function coerceOptionalVersion(input: JsonObject): string | undefined {
  const rawVersion = input.version;

  if (rawVersion === undefined || rawVersion === null) {
    return undefined;
  }

  if (typeof rawVersion !== 'string') {
    throw new ToolError('INVALID_INPUT', 'version must be a string when provided.');
  }

  return rawVersion;
}

function coerceOptionalThemeId(input: JsonObject): string | undefined {
  const rawThemeId = input.themeId;

  if (rawThemeId === undefined || rawThemeId === null) {
    return undefined;
  }

  if (typeof rawThemeId !== 'string') {
    throw new ToolError('INVALID_INPUT', 'themeId must be a string when provided.');
  }

  return rawThemeId;
}

function coerceOptionalFontSetId(input: JsonObject): string | undefined {
  const rawFontSetId = input.fontSetId;

  if (rawFontSetId === undefined || rawFontSetId === null) {
    return undefined;
  }

  if (typeof rawFontSetId !== 'string') {
    throw new ToolError('INVALID_INPUT', 'fontSetId must be a string when provided.');
  }

  return rawFontSetId;
}

function coerceFileId(input: JsonObject): string {
  const rawFileId = input.fileId;

  if (typeof rawFileId !== 'string' || rawFileId.length === 0) {
    throw new ToolError('INVALID_INPUT', 'fileId is required and must be a non-empty string.');
  }

  return rawFileId;
}

function coerceOptionalBlueprintId(input: JsonObject): string | undefined {
  const rawBlueprintId = input.blueprintId;

  if (rawBlueprintId === undefined || rawBlueprintId === null) {
    return undefined;
  }

  if (typeof rawBlueprintId !== 'string' || rawBlueprintId.length === 0) {
    throw new ToolError('INVALID_INPUT', 'blueprintId must be a non-empty string when provided.');
  }

  return rawBlueprintId;
}

function coerceComponentId(input: JsonObject): string {
  const rawComponentId = input.componentId;

  if (typeof rawComponentId !== 'string' || rawComponentId.length === 0) {
    throw new ToolError('INVALID_INPUT', 'componentId is required and must be a non-empty string.');
  }

  return rawComponentId;
}

function sanitizeError(error: unknown): ToolError {
  if (error instanceof ToolError) {
    return error;
  }

  if (error instanceof Error) {
    return new ToolError('INTERNAL_ERROR', error.message);
  }

  return new ToolError('INTERNAL_ERROR', 'Unexpected error while handling tool call.');
}

function resolveVersionOrThrow(store: UiCoreArtifactStore, input: JsonObject) {
  try {
    return store.resolveVersion(coerceOptionalVersion(input));
  } catch {
    throw new ToolError('VERSION_NOT_FOUND', 'Requested version is not available for ui-core artifacts.', {
      requestedVersion: input.version === undefined ? null : input.version,
      availableVersions: [...store.availableVersions()]
    });
  }
}

function resolveThemeIdOrThrow(store: UiCoreArtifactStore, input: JsonObject): string {
  try {
    return store.resolveBaseThemeId(coerceOptionalThemeId(input));
  } catch {
    throw new ToolError('THEME_NOT_FOUND', 'Requested themeId is not available.', {
      requestedThemeId: input.themeId === undefined ? null : input.themeId,
      availableThemeIds: store.listBaseThemeDescriptors().map((entry) => entry.themeId)
    });
  }
}

function resolveFontSetIdOrThrow(store: UiCoreArtifactStore, input: JsonObject): string {
  try {
    return store.resolveFontSetId(coerceOptionalFontSetId(input));
  } catch {
    throw new ToolError('FONT_SET_NOT_FOUND', 'Requested fontSetId is not available.', {
      requestedFontSetId: input.fontSetId === undefined ? null : input.fontSetId,
      availableFontSetIds: store.listBaseFontSetDescriptors().map((entry) => entry.fontSetId)
    });
  }
}

function createStatusTool(store: UiCoreArtifactStore): ToolHandler {
  return () => {
    const componentDescriptors = store.listComponentDescriptors();
    const missingComponentArtifactIds = componentDescriptors
      .filter((entry) => !store.hasComponentArtifact(entry.componentId))
      .map((entry) => entry.componentId);
    const missingBlueprintIds = componentDescriptors
      .filter((entry) => !store.hasBlueprintArtifact(entry.componentId))
      .map((entry) => entry.componentId);

    return success({
      package: {
        name: store.packageIdentity.name,
        version: store.packageIdentity.version
      },
      availableVersions: [...store.availableVersions()],
      available: {
        components: componentDescriptors.map((entry) => entry.componentId),
        componentTagMap: componentDescriptors.map((entry) => ({
          componentId: entry.componentId,
          tagName: entry.tagName
        })),
        themes: store.listBaseThemeDescriptors().map((entry) => ({
          themeId: entry.themeId
        })),
        fontSets: store.listBaseFontSetDescriptors().map((entry) => ({
          fontSetId: entry.fontSetId
        })),
        blueprints: componentDescriptors.map((entry) => ({
          blueprintId: `${entry.componentId}.blueprint`,
          componentId: entry.componentId
        }))
      },
      health: {
        componentArtifactsPresent: missingComponentArtifactIds.length === 0,
        missingComponentArtifactIds,
        blueprintsPresent: missingBlueprintIds.length === 0,
        missingBlueprintIds,
        baseThemeArtifactPresent: store.hasBaseThemeArtifact(),
        baseFontsCssArtifactPresent: store.hasBaseFontsCssArtifact(),
        baseFontFilesPresent: store
          .listBaseFontFileDescriptors(store.baseFontSetDescriptor.fontSetId)
          .every((entry) => store.hasBaseFontFileArtifact(entry.fileId))
      }
    });
  };
}

function createListComponentsTool(store: UiCoreArtifactStore): ToolHandler {
  return (input) => {
    const options = input === undefined ? {} : assertObject(input, 'options');
    const versionResolution = resolveVersionOrThrow(store, options);
    const components = store.listComponentDescriptors().map((entry) => {
      const artifactPresent = store.hasComponentArtifact(entry.componentId);

      if (!artifactPresent) {
        return {
          componentId: entry.componentId,
          tagName: entry.tagName,
          artifactId: entry.artifactId,
          artifactFileName: entry.artifactFileName,
          artifactRef: entry.artifactRelativePath,
          contentType: 'text/javascript',
          availableVersions: [...store.availableVersions()],
          artifactPresent: false,
          artifactHash: null,
          artifactSizeBytes: null
        } satisfies JsonObject;
      }

      const artifact = store.readComponentArtifact(entry.componentId);

      return {
        componentId: entry.componentId,
        tagName: entry.tagName,
        artifactId: entry.artifactId,
        artifactFileName: entry.artifactFileName,
        artifactRef: entry.artifactRelativePath,
        contentType: artifact.contentType,
        availableVersions: [...store.availableVersions()],
        artifactPresent: true,
        artifactHash: artifact.hash,
        artifactSizeBytes: artifact.sizeBytes
      } satisfies JsonObject;
    });

    return success({
      package: {
        name: store.packageIdentity.name,
        version: store.packageIdentity.version
      },
      requestedVersion: versionResolution.requestedVersion,
      resolvedVersion: versionResolution.resolvedVersion,
      components
    });
  };
}

function createGetComponentArtifactTool(store: UiCoreArtifactStore): ToolHandler {
  return (input) => {
    const params = assertObject(input, 'input');
    const componentId = coerceComponentId(params);
    const versionResolution = resolveVersionOrThrow(store, params);
    const descriptor = store.findComponentDescriptor(componentId);

    if (!descriptor) {
      throw new ToolError('COMPONENT_NOT_FOUND', `Unknown componentId "${componentId}".`, {
        componentId,
        availableComponentIds: componentBlueprints.map((entry) => entry.componentId)
      });
    }

    if (!store.hasComponentArtifact(componentId)) {
      throw new ToolError('COMPONENT_ARTIFACT_MISSING', `Component artifact is missing for "${componentId}".`, {
        componentId,
        artifactRef: descriptor.artifactRelativePath
      });
    }

    const artifact = store.readComponentArtifact(componentId);

    return success({
      package: {
        name: store.packageIdentity.name,
        version: store.packageIdentity.version
      },
      componentId,
      tagName: descriptor.tagName,
      version: versionResolution.resolvedVersion,
      artifact: {
        fileId: descriptor.artifactId,
        fileName: artifact.fileName,
        contentType: artifact.contentType,
        encoding: 'utf8',
        sizeBytes: artifact.sizeBytes,
        hash: artifact.hash,
        mtimeMs: artifact.mtimeMs,
        content: artifact.content
      }
    });
  };
}

function createGetBaseThemeTool(store: UiCoreArtifactStore): ToolHandler {
  return (input) => {
    const params = input === undefined ? {} : assertObject(input, 'input');
    const versionResolution = resolveVersionOrThrow(store, params);
    const themeId = resolveThemeIdOrThrow(store, params);

    if (!store.hasBaseThemeArtifact()) {
      throw new ToolError('THEME_ARTIFACT_MISSING', 'Base theme CSS artifact is missing.', {
        themeId,
        artifactRef: store.baseThemeDescriptor.relativePath
      });
    }

    const artifact = store.readBaseThemeArtifact(themeId);

    return success({
      package: {
        name: store.packageIdentity.name,
        version: store.packageIdentity.version
      },
      themeId,
      version: versionResolution.resolvedVersion,
      artifact: {
        fileId: store.baseThemeDescriptor.fileId,
        fileName: artifact.fileName,
        contentType: artifact.contentType,
        encoding: 'utf8',
        sizeBytes: artifact.sizeBytes,
        hash: artifact.hash,
        mtimeMs: artifact.mtimeMs,
        content: artifact.content
      }
    });
  };
}

function createGetBaseFontsTool(store: UiCoreArtifactStore): ToolHandler {
  return (input) => {
    const params = input === undefined ? {} : assertObject(input, 'input');
    const versionResolution = resolveVersionOrThrow(store, params);
    const fontSetId = resolveFontSetIdOrThrow(store, params);

    if (!store.hasBaseFontsCssArtifact()) {
      throw new ToolError('BASE_FONTS_ARTIFACT_MISSING', 'Base fonts CSS artifact is missing.', {
        fontSetId,
        artifactRef: store.baseFontSetDescriptor.cssRelativePath
      });
    }

    const artifact = store.readBaseFontsCssArtifact(fontSetId);

    return success({
      package: {
        name: store.packageIdentity.name,
        version: store.packageIdentity.version
      },
      fontSetId,
      version: versionResolution.resolvedVersion,
      artifact: {
        fileId: store.baseFontSetDescriptor.cssFileId,
        fileName: artifact.fileName,
        contentType: artifact.contentType,
        encoding: 'utf8',
        sizeBytes: artifact.sizeBytes,
        hash: artifact.hash,
        mtimeMs: artifact.mtimeMs,
        content: artifact.content
      }
    });
  };
}

function createListBaseFontFilesTool(store: UiCoreArtifactStore): ToolHandler {
  return (input) => {
    const params = input === undefined ? {} : assertObject(input, 'input');
    const versionResolution = resolveVersionOrThrow(store, params);
    const fontSetId = resolveFontSetIdOrThrow(store, params);

    const files = store.listBaseFontFileDescriptors(fontSetId).map((entry) => {
      if (!store.hasBaseFontFileArtifact(entry.fileId)) {
        return {
          fileId: entry.fileId,
          fileName: entry.fileName,
          fileRef: entry.relativePath,
          contentType: 'application/octet-stream',
          hash: null,
          sizeBytes: null,
          present: false
        } satisfies JsonObject;
      }

      const artifact = store.readBaseFontFileArtifact(entry.fileId);

      return {
        fileId: entry.fileId,
        fileName: artifact.fileName,
        fileRef: artifact.relativePath,
        contentType: artifact.contentType,
        hash: artifact.hash,
        sizeBytes: artifact.sizeBytes,
        present: true
      } satisfies JsonObject;
    });

    return success({
      package: {
        name: store.packageIdentity.name,
        version: store.packageIdentity.version
      },
      fontSetId,
      requestedVersion: versionResolution.requestedVersion,
      resolvedVersion: versionResolution.resolvedVersion,
      files
    });
  };
}

function createGetBaseFontFileTool(store: UiCoreArtifactStore): ToolHandler {
  return (input) => {
    const params = assertObject(input, 'input');
    const fileId = coerceFileId(params);
    const descriptor = store.findBaseFontFileDescriptor(fileId);

    if (!descriptor) {
      throw new ToolError('FONT_FILE_NOT_FOUND', `Unknown base font fileId "${fileId}".`, {
        fileId,
        availableFileIds: store
          .listBaseFontFileDescriptors(store.baseFontSetDescriptor.fontSetId)
          .map((entry) => entry.fileId)
      });
    }

    if (!store.hasBaseFontFileArtifact(fileId)) {
      throw new ToolError('BASE_FONT_FILE_MISSING', 'Base font file artifact is missing.', {
        fileId,
        fileRef: descriptor.relativePath
      });
    }

    const artifact = store.readBaseFontFileArtifact(fileId);

    return success({
      package: {
        name: store.packageIdentity.name,
        version: store.packageIdentity.version
      },
      fontSetId: descriptor.fontSetId,
      fileId: descriptor.fileId,
      artifact: {
        fileName: artifact.fileName,
        contentType: artifact.contentType,
        encoding: 'base64',
        sizeBytes: artifact.sizeBytes,
        hash: artifact.hash,
        mtimeMs: artifact.mtimeMs,
        contentBase64: artifact.contentBase64
      }
    });
  };
}

function createListBlueprintsTool(store: UiCoreArtifactStore): ToolHandler {
  return (input) => {
    const params = input === undefined ? {} : assertObject(input, 'options');
    const versionResolution = resolveVersionOrThrow(store, params);

    const blueprints = store.listBlueprintDescriptors().map((entry) => {
      const present = store.hasBlueprintArtifact(entry.componentId);

      if (!present) {
        return {
          blueprintId: entry.blueprintId,
          componentId: entry.componentId,
          fileName: entry.fileName,
          fileRef: entry.relativePath,
          contentType: 'text/typescript',
          present: false,
          hash: null,
          sizeBytes: null,
          availableVersions: [...store.availableVersions()]
        } satisfies JsonObject;
      }

      const artifact = store.readBlueprintArtifactByBlueprintId(entry.blueprintId);

      return {
        blueprintId: entry.blueprintId,
        componentId: entry.componentId,
        fileName: entry.fileName,
        fileRef: entry.relativePath,
        contentType: artifact.contentType,
        present: true,
        hash: artifact.hash,
        sizeBytes: artifact.sizeBytes,
        availableVersions: [...store.availableVersions()]
      } satisfies JsonObject;
    });

    return success({
      package: {
        name: store.packageIdentity.name,
        version: store.packageIdentity.version
      },
      requestedVersion: versionResolution.requestedVersion,
      resolvedVersion: versionResolution.resolvedVersion,
      blueprints
    });
  };
}

function createGetBlueprintTool(store: UiCoreArtifactStore): ToolHandler {
  return (input) => {
    const params = assertObject(input, 'input');
    const versionResolution = resolveVersionOrThrow(store, params);
    const blueprintId = coerceOptionalBlueprintId(params);
    const componentId = params.componentId === undefined ? undefined : coerceComponentId(params);

    if (!blueprintId && !componentId) {
      throw new ToolError(
        'INVALID_INPUT',
        'Either blueprintId or componentId is required to resolve a blueprint artifact.'
      );
    }

    const descriptor = blueprintId
      ? store.findBlueprintDescriptorByBlueprintId(blueprintId)
      : store.listBlueprintDescriptors().find((entry) => entry.componentId === componentId);

    if (!descriptor) {
      throw new ToolError('BLUEPRINT_NOT_FOUND', 'Requested blueprint is not available.', {
        requestedBlueprintId: blueprintId ?? null,
        requestedComponentId: componentId ?? null,
        availableBlueprintIds: store.listBlueprintDescriptors().map((entry) => entry.blueprintId)
      });
    }

    if (!store.hasBlueprintArtifact(descriptor.componentId)) {
      throw new ToolError('BLUEPRINT_ARTIFACT_MISSING', 'Blueprint artifact is missing.', {
        blueprintId: descriptor.blueprintId,
        componentId: descriptor.componentId,
        fileRef: descriptor.relativePath
      });
    }

    const artifact = store.readBlueprintArtifactByBlueprintId(descriptor.blueprintId);

    return success({
      package: {
        name: store.packageIdentity.name,
        version: store.packageIdentity.version
      },
      blueprintId: descriptor.blueprintId,
      componentId: descriptor.componentId,
      version: versionResolution.resolvedVersion,
      artifact: {
        fileName: artifact.fileName,
        contentType: artifact.contentType,
        encoding: 'utf8',
        sizeBytes: artifact.sizeBytes,
        hash: artifact.hash,
        mtimeMs: artifact.mtimeMs,
        content: artifact.content
      }
    });
  };
}

export function toolDefinitionsV1(): readonly ToolDefinition[] {
  return [
    {
      name: TOOL_NAMES.getStatus,
      description: 'Returns a facts-only snapshot of ui-core distribution artifact availability.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {}
      }
    },
    {
      name: TOOL_NAMES.listComponents,
      description: 'Lists ui-core component artifacts and stable tag mappings.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          version: { type: 'string' }
        }
      }
    },
    {
      name: TOOL_NAMES.getComponentArtifact,
      description: 'Returns a built ui-core Web Component JavaScript artifact.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['componentId'],
        properties: {
          componentId: { type: 'string' },
          version: { type: 'string' }
        }
      }
    },
    {
      name: TOOL_NAMES.getBaseTheme,
      description: 'Returns the single global ui-core base theme CSS artifact.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          themeId: { type: 'string' },
          version: { type: 'string' }
        }
      }
    },
    {
      name: TOOL_NAMES.getBaseFonts,
      description: 'Returns the base fonts CSS artifact with @font-face declarations.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          fontSetId: { type: 'string' },
          version: { type: 'string' }
        }
      }
    },
    {
      name: TOOL_NAMES.listBaseFontFiles,
      description: 'Lists distributable base font files for the selected ui-core font set.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          fontSetId: { type: 'string' },
          version: { type: 'string' }
        }
      }
    },
    {
      name: TOOL_NAMES.getBaseFontFile,
      description: 'Returns a base font file as base64-encoded bytes with content metadata.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['fileId'],
        properties: {
          fileId: { type: 'string' }
        }
      }
    },
    {
      name: TOOL_NAMES.listBlueprints,
      description: 'Lists ui-core blueprint artifacts and their component mappings.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          version: { type: 'string' }
        }
      }
    },
    {
      name: TOOL_NAMES.getBlueprint,
      description: 'Returns a blueprint artifact by blueprintId or componentId.',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          blueprintId: { type: 'string' },
          componentId: { type: 'string' },
          version: { type: 'string' }
        }
      }
    }
  ] satisfies readonly ToolDefinition[];
}

export function createToolHandlersV1(store: UiCoreArtifactStore): Readonly<Record<string, ToolHandler>> {
  return Object.freeze({
    [TOOL_NAMES.getStatus]: wrapToolHandler(createStatusTool(store)),
    [TOOL_NAMES.listComponents]: wrapToolHandler(createListComponentsTool(store)),
    [TOOL_NAMES.getComponentArtifact]: wrapToolHandler(createGetComponentArtifactTool(store)),
    [TOOL_NAMES.getBaseTheme]: wrapToolHandler(createGetBaseThemeTool(store)),
    [TOOL_NAMES.getBaseFonts]: wrapToolHandler(createGetBaseFontsTool(store)),
    [TOOL_NAMES.listBaseFontFiles]: wrapToolHandler(createListBaseFontFilesTool(store)),
    [TOOL_NAMES.getBaseFontFile]: wrapToolHandler(createGetBaseFontFileTool(store)),
    [TOOL_NAMES.listBlueprints]: wrapToolHandler(createListBlueprintsTool(store)),
    [TOOL_NAMES.getBlueprint]: wrapToolHandler(createGetBlueprintTool(store))
  });
}

function wrapToolHandler(handler: ToolHandler): ToolHandler {
  return (input) => {
    try {
      return handler(input);
    } catch (error) {
      return failure(sanitizeError(error));
    }
  };
}
