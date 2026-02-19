import { componentBlueprints } from '../blueprint/components/index.js';
import { UiCoreArtifactStore } from './artifact-store.js';
import type { JsonObject, ToolErrorResult, ToolResult, ToolSuccessResult } from './types.js';
import { ToolError } from './types.js';

export type ToolHandler = (input: unknown) => ToolResult;

const TOOL_NAMES = Object.freeze({
  getStatus: 'getStatus',
  listComponents: 'listComponents',
  getComponentArtifact: 'getComponentArtifact'
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
        themes: [],
        fontSets: [],
        blueprints: componentDescriptors.map((entry) => ({
          blueprintId: `${entry.componentId}.blueprint`,
          componentId: entry.componentId
        }))
      },
      health: {
        componentArtifactsPresent: missingComponentArtifactIds.length === 0,
        missingComponentArtifactIds,
        blueprintsPresent: missingBlueprintIds.length === 0,
        missingBlueprintIds
      }
    });
  };
}

function createListComponentsTool(store: UiCoreArtifactStore): ToolHandler {
  return (input) => {
    const options = input === undefined ? {} : assertObject(input, 'options');
    const versionResolution = store.resolveVersion(coerceOptionalVersion(options));
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
    const versionResolution = store.resolveVersion(coerceOptionalVersion(params));
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
    }
  ] satisfies readonly ToolDefinition[];
}

export function createToolHandlersV1(store: UiCoreArtifactStore): Readonly<Record<string, ToolHandler>> {
  return Object.freeze({
    [TOOL_NAMES.getStatus]: wrapToolHandler(createStatusTool(store)),
    [TOOL_NAMES.listComponents]: wrapToolHandler(createListComponentsTool(store)),
    [TOOL_NAMES.getComponentArtifact]: wrapToolHandler(createGetComponentArtifactTool(store))
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
