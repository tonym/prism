import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { componentBlueprints } from '../blueprint/components/index.js';
import { stableHash } from '../determinism/stable-hash.js';
import { artifactFileNameForBlueprint } from '../generator/generate-components.js';
import type { JsonObject, PackageIdentity } from './types.js';

const UI_CORE_PACKAGE_PATH = 'package.json';
const GENERATED_COMPONENTS_DIRECTORY = 'src/generated/components';
const BLUEPRINT_COMPONENTS_DIRECTORY = 'src/blueprint/components';

export interface VersionResolution {
  requestedVersion: string | null;
  resolvedVersion: string;
}

export interface ResolvedArtifactText {
  absolutePath: string;
  relativePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  hash: string;
  content: string;
  mtimeMs: number;
}

export interface ResolvedArtifactBinary {
  absolutePath: string;
  relativePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  hash: string;
  contentBase64: string;
  mtimeMs: number;
}

export interface ComponentArtifactDescriptor {
  componentId: string;
  tagName: string;
  artifactId: string;
  artifactFileName: string;
  artifactRelativePath: string;
  artifactAbsolutePath: string;
  blueprintFileName: string;
  blueprintRelativePath: string;
  blueprintAbsolutePath: string;
}

function parsePackageIdentity(content: string): PackageIdentity {
  const parsed = JSON.parse(content) as Record<string, unknown>;
  const name = typeof parsed.name === 'string' ? parsed.name : '@prism/ui-core';
  const version = typeof parsed.version === 'string' ? parsed.version : '0.0.0';
  return { name, version };
}

function resolveUiCoreRootDirectory(startDirectory: string): string {
  const candidates = [
    startDirectory,
    path.join(startDirectory, 'packages/ui-core')
  ];

  for (const candidate of candidates) {
    const generatedPath = path.join(candidate, GENERATED_COMPONENTS_DIRECTORY);
    const packageJsonPath = path.join(candidate, UI_CORE_PACKAGE_PATH);

    if (existsSync(generatedPath) && existsSync(packageJsonPath)) {
      return candidate;
    }
  }

  throw new Error(
    `Could not resolve ui-core root directory from "${startDirectory}". Checked: ${candidates.join(', ')}.`
  );
}

function inferContentType(fileName: string): string {
  if (fileName.endsWith('.js')) {
    return 'text/javascript';
  }

  if (fileName.endsWith('.css')) {
    return 'text/css';
  }

  if (fileName.endsWith('.ts')) {
    return 'text/typescript';
  }

  if (fileName.endsWith('.woff2')) {
    return 'font/woff2';
  }

  if (fileName.endsWith('.woff')) {
    return 'font/woff';
  }

  return 'application/octet-stream';
}

function resolveComponentDescriptors(rootDirectory: string): readonly ComponentArtifactDescriptor[] {
  return [...componentBlueprints]
    .sort((left, right) => left.componentId.localeCompare(right.componentId))
    .map((blueprint) => {
      const artifactFileName = artifactFileNameForBlueprint(blueprint);
      const artifactRelativePath = `${GENERATED_COMPONENTS_DIRECTORY}/${artifactFileName}`;
      const blueprintFileName = `${blueprint.componentId}.blueprint.ts`;
      const blueprintRelativePath = `${BLUEPRINT_COMPONENTS_DIRECTORY}/${blueprintFileName}`;

      return {
        componentId: blueprint.componentId,
        tagName: blueprint.tagName,
        artifactId: blueprint.componentId,
        artifactFileName,
        artifactRelativePath,
        artifactAbsolutePath: path.join(rootDirectory, artifactRelativePath),
        blueprintFileName,
        blueprintRelativePath,
        blueprintAbsolutePath: path.join(rootDirectory, blueprintRelativePath)
      } satisfies ComponentArtifactDescriptor;
    });
}

function resolveTextArtifact(absolutePath: string, relativePath: string): ResolvedArtifactText {
  const content = readFileSync(absolutePath, 'utf8');
  const stats = statSync(absolutePath);

  return {
    absolutePath,
    relativePath,
    fileName: path.basename(absolutePath),
    contentType: inferContentType(absolutePath),
    sizeBytes: stats.size,
    hash: stableHash(content),
    content,
    mtimeMs: stats.mtimeMs
  };
}

function resolveBinaryArtifact(absolutePath: string, relativePath: string): ResolvedArtifactBinary {
  const contentBase64 = readFileSync(absolutePath, 'base64');
  const stats = statSync(absolutePath);

  return {
    absolutePath,
    relativePath,
    fileName: path.basename(absolutePath),
    contentType: inferContentType(absolutePath),
    sizeBytes: stats.size,
    hash: stableHash(contentBase64),
    contentBase64,
    mtimeMs: stats.mtimeMs
  };
}

function ensureFileExists(absolutePath: string, artifactLabel: string, details: JsonObject): void {
  if (!existsSync(absolutePath)) {
    throw new Error(`${artifactLabel} is missing at "${absolutePath}". ${JSON.stringify(details)}`);
  }
}

export class UiCoreArtifactStore {
  readonly rootDirectory: string;
  readonly packageIdentity: PackageIdentity;
  readonly componentDescriptors: readonly ComponentArtifactDescriptor[];

  constructor(startDirectory: string = process.cwd()) {
    this.rootDirectory = resolveUiCoreRootDirectory(startDirectory);
    this.packageIdentity = parsePackageIdentity(
      readFileSync(path.join(this.rootDirectory, UI_CORE_PACKAGE_PATH), 'utf8')
    );
    this.componentDescriptors = resolveComponentDescriptors(this.rootDirectory);
  }

  availableVersions(): readonly string[] {
    return [this.packageIdentity.version];
  }

  resolveVersion(requestedVersion: unknown): VersionResolution {
    if (requestedVersion === undefined || requestedVersion === null) {
      return {
        requestedVersion: null,
        resolvedVersion: this.packageIdentity.version
      };
    }

    if (typeof requestedVersion !== 'string') {
      throw new Error(`Version must be a string when provided. Received type "${typeof requestedVersion}".`);
    }

    if (requestedVersion === this.packageIdentity.version) {
      return {
        requestedVersion,
        resolvedVersion: requestedVersion
      };
    }

    throw new Error(
      `Unsupported version "${requestedVersion}". Available versions: ${this.packageIdentity.version}.`
    );
  }

  listComponentDescriptors(): readonly ComponentArtifactDescriptor[] {
    return this.componentDescriptors;
  }

  findComponentDescriptor(componentId: string): ComponentArtifactDescriptor | undefined {
    return this.componentDescriptors.find((entry) => entry.componentId === componentId);
  }

  hasComponentArtifact(componentId: string): boolean {
    const descriptor = this.findComponentDescriptor(componentId);
    return descriptor ? existsSync(descriptor.artifactAbsolutePath) : false;
  }

  hasBlueprintArtifact(componentId: string): boolean {
    const descriptor = this.findComponentDescriptor(componentId);
    return descriptor ? existsSync(descriptor.blueprintAbsolutePath) : false;
  }

  readComponentArtifact(componentId: string): ResolvedArtifactText {
    const descriptor = this.findComponentDescriptor(componentId);

    if (!descriptor) {
      throw new Error(`Unknown componentId "${componentId}".`);
    }

    ensureFileExists(descriptor.artifactAbsolutePath, 'Component artifact', {
      componentId,
      artifactPath: descriptor.artifactRelativePath
    });

    return resolveTextArtifact(descriptor.artifactAbsolutePath, descriptor.artifactRelativePath);
  }

  readBlueprintArtifactByComponent(componentId: string): ResolvedArtifactText {
    const descriptor = this.findComponentDescriptor(componentId);

    if (!descriptor) {
      throw new Error(`Unknown componentId "${componentId}".`);
    }

    ensureFileExists(descriptor.blueprintAbsolutePath, 'Blueprint artifact', {
      componentId,
      blueprintPath: descriptor.blueprintRelativePath
    });

    return resolveTextArtifact(descriptor.blueprintAbsolutePath, descriptor.blueprintRelativePath);
  }

  readTextArtifact(relativePath: string): ResolvedArtifactText {
    const absolutePath = path.join(this.rootDirectory, relativePath);
    ensureFileExists(absolutePath, 'Text artifact', { relativePath });
    return resolveTextArtifact(absolutePath, relativePath);
  }

  readBinaryArtifact(relativePath: string): ResolvedArtifactBinary {
    const absolutePath = path.join(this.rootDirectory, relativePath);
    ensureFileExists(absolutePath, 'Binary artifact', { relativePath });
    return resolveBinaryArtifact(absolutePath, relativePath);
  }
}
