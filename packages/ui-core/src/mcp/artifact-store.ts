import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

import { componentBlueprints } from '../blueprint/components/index.js';
import { stableHash } from '../determinism/stable-hash.js';
import { artifactFileNameForBlueprint } from '../generator/generate-components.js';
import type { JsonObject, PackageIdentity } from './types.js';

const UI_CORE_PACKAGE_PATH = 'package.json';
const GENERATED_COMPONENTS_DIRECTORY = 'src/generated/components';
const BLUEPRINT_COMPONENTS_DIRECTORY = 'src/blueprint/components';
const GENERATED_THEME_DIRECTORY = 'src/generated/theme';
const GENERATED_FONTS_DIRECTORY = 'src/generated/fonts';
const GENERATED_FONT_FILES_DIRECTORY = 'src/generated/fonts/files';

export const BASE_THEME_ID = 'prism-base';
export const BASE_THEME_FILE_NAME = 'prism-base-theme.css';
export const BASE_THEME_RELATIVE_PATH = `${GENERATED_THEME_DIRECTORY}/${BASE_THEME_FILE_NAME}`;

export const BASE_FONT_SET_ID = 'prism-base';
export const BASE_FONTS_FILE_NAME = 'prism-base-fonts.css';
export const BASE_FONTS_RELATIVE_PATH = `${GENERATED_FONTS_DIRECTORY}/${BASE_FONTS_FILE_NAME}`;

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

export interface BlueprintArtifactDescriptor {
  blueprintId: string;
  componentId: string;
  fileName: string;
  relativePath: string;
  absolutePath: string;
}

export interface BaseThemeDescriptor {
  themeId: string;
  fileId: string;
  fileName: string;
  relativePath: string;
  absolutePath: string;
}

export interface BaseFontSetDescriptor {
  fontSetId: string;
  cssFileId: string;
  cssFileName: string;
  cssRelativePath: string;
  cssAbsolutePath: string;
  fontFilesDirectoryRelativePath: string;
  fontFilesDirectoryAbsolutePath: string;
}

export interface BaseFontFileDescriptor {
  fontSetId: string;
  fileId: string;
  fileName: string;
  relativePath: string;
  absolutePath: string;
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

function resolveBaseThemeDescriptor(rootDirectory: string): BaseThemeDescriptor {
  return {
    themeId: BASE_THEME_ID,
    fileId: BASE_THEME_FILE_NAME,
    fileName: BASE_THEME_FILE_NAME,
    relativePath: BASE_THEME_RELATIVE_PATH,
    absolutePath: path.join(rootDirectory, BASE_THEME_RELATIVE_PATH)
  };
}

function resolveBaseFontSetDescriptor(rootDirectory: string): BaseFontSetDescriptor {
  return {
    fontSetId: BASE_FONT_SET_ID,
    cssFileId: BASE_FONTS_FILE_NAME,
    cssFileName: BASE_FONTS_FILE_NAME,
    cssRelativePath: BASE_FONTS_RELATIVE_PATH,
    cssAbsolutePath: path.join(rootDirectory, BASE_FONTS_RELATIVE_PATH),
    fontFilesDirectoryRelativePath: GENERATED_FONT_FILES_DIRECTORY,
    fontFilesDirectoryAbsolutePath: path.join(rootDirectory, GENERATED_FONT_FILES_DIRECTORY)
  };
}

function resolveBaseFontFileDescriptors(
  rootDirectory: string,
  fontSetId: string
): readonly BaseFontFileDescriptor[] {
  const fontDirectoryPath = path.join(rootDirectory, GENERATED_FONT_FILES_DIRECTORY);

  if (!existsSync(fontDirectoryPath)) {
    return [];
  }

  return readdirSync(fontDirectoryPath)
    .filter((entry) => !entry.startsWith('.') && entry.length > 0)
    .sort((left, right) => left.localeCompare(right))
    .map((fileName) => {
      const relativePath = `${GENERATED_FONT_FILES_DIRECTORY}/${fileName}`;
      return {
        fontSetId,
        fileId: fileName,
        fileName,
        relativePath,
        absolutePath: path.join(rootDirectory, relativePath)
      } satisfies BaseFontFileDescriptor;
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
  readonly baseThemeDescriptor: BaseThemeDescriptor;
  readonly baseFontSetDescriptor: BaseFontSetDescriptor;
  readonly baseFontFileDescriptors: readonly BaseFontFileDescriptor[];

  constructor(startDirectory: string = process.cwd()) {
    this.rootDirectory = resolveUiCoreRootDirectory(startDirectory);
    this.packageIdentity = parsePackageIdentity(
      readFileSync(path.join(this.rootDirectory, UI_CORE_PACKAGE_PATH), 'utf8')
    );
    this.componentDescriptors = resolveComponentDescriptors(this.rootDirectory);
    this.baseThemeDescriptor = resolveBaseThemeDescriptor(this.rootDirectory);
    this.baseFontSetDescriptor = resolveBaseFontSetDescriptor(this.rootDirectory);
    this.baseFontFileDescriptors = resolveBaseFontFileDescriptors(
      this.rootDirectory,
      this.baseFontSetDescriptor.fontSetId
    );
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

  listBlueprintDescriptors(): readonly BlueprintArtifactDescriptor[] {
    return this.componentDescriptors.map((entry) => ({
      blueprintId: `${entry.componentId}.blueprint`,
      componentId: entry.componentId,
      fileName: entry.blueprintFileName,
      relativePath: entry.blueprintRelativePath,
      absolutePath: entry.blueprintAbsolutePath
    }));
  }

  findBlueprintDescriptorByBlueprintId(blueprintId: string): BlueprintArtifactDescriptor | undefined {
    return this.listBlueprintDescriptors().find((entry) => entry.blueprintId === blueprintId);
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

  readBlueprintArtifactByBlueprintId(blueprintId: string): ResolvedArtifactText {
    const descriptor = this.findBlueprintDescriptorByBlueprintId(blueprintId);

    if (!descriptor) {
      throw new Error(`Unknown blueprintId "${blueprintId}".`);
    }

    ensureFileExists(descriptor.absolutePath, 'Blueprint artifact', {
      blueprintId: descriptor.blueprintId,
      relativePath: descriptor.relativePath
    });

    return resolveTextArtifact(descriptor.absolutePath, descriptor.relativePath);
  }

  resolveBaseThemeId(requestedThemeId: unknown): string {
    if (requestedThemeId === undefined || requestedThemeId === null) {
      return this.baseThemeDescriptor.themeId;
    }

    if (typeof requestedThemeId !== 'string') {
      throw new Error(`themeId must be a string when provided. Received type "${typeof requestedThemeId}".`);
    }

    if (requestedThemeId !== this.baseThemeDescriptor.themeId) {
      throw new Error(
        `Unknown themeId "${requestedThemeId}". Available themeIds: ${this.baseThemeDescriptor.themeId}.`
      );
    }

    return requestedThemeId;
  }

  resolveFontSetId(requestedFontSetId: unknown): string {
    if (requestedFontSetId === undefined || requestedFontSetId === null) {
      return this.baseFontSetDescriptor.fontSetId;
    }

    if (typeof requestedFontSetId !== 'string') {
      throw new Error(
        `fontSetId must be a string when provided. Received type "${typeof requestedFontSetId}".`
      );
    }

    if (requestedFontSetId !== this.baseFontSetDescriptor.fontSetId) {
      throw new Error(
        `Unknown fontSetId "${requestedFontSetId}". Available fontSetIds: ${this.baseFontSetDescriptor.fontSetId}.`
      );
    }

    return requestedFontSetId;
  }

  listBaseThemeDescriptors(): readonly BaseThemeDescriptor[] {
    return [this.baseThemeDescriptor];
  }

  listBaseFontSetDescriptors(): readonly BaseFontSetDescriptor[] {
    return [this.baseFontSetDescriptor];
  }

  listBaseFontFileDescriptors(fontSetId: string): readonly BaseFontFileDescriptor[] {
    if (fontSetId !== this.baseFontSetDescriptor.fontSetId) {
      return [];
    }

    return this.baseFontFileDescriptors;
  }

  findBaseFontFileDescriptor(fileId: string): BaseFontFileDescriptor | undefined {
    return this.baseFontFileDescriptors.find((entry) => entry.fileId === fileId);
  }

  hasBaseThemeArtifact(): boolean {
    return existsSync(this.baseThemeDescriptor.absolutePath);
  }

  hasBaseFontsCssArtifact(): boolean {
    return existsSync(this.baseFontSetDescriptor.cssAbsolutePath);
  }

  hasBaseFontFileArtifact(fileId: string): boolean {
    const descriptor = this.findBaseFontFileDescriptor(fileId);
    return descriptor ? existsSync(descriptor.absolutePath) : false;
  }

  readBaseThemeArtifact(themeId: string): ResolvedArtifactText {
    if (themeId !== this.baseThemeDescriptor.themeId) {
      throw new Error(
        `Unknown themeId "${themeId}". Available themeIds: ${this.baseThemeDescriptor.themeId}.`
      );
    }

    ensureFileExists(this.baseThemeDescriptor.absolutePath, 'Base theme artifact', {
      themeId: this.baseThemeDescriptor.themeId,
      relativePath: this.baseThemeDescriptor.relativePath
    });

    return resolveTextArtifact(this.baseThemeDescriptor.absolutePath, this.baseThemeDescriptor.relativePath);
  }

  readBaseFontsCssArtifact(fontSetId: string): ResolvedArtifactText {
    if (fontSetId !== this.baseFontSetDescriptor.fontSetId) {
      throw new Error(
        `Unknown fontSetId "${fontSetId}". Available fontSetIds: ${this.baseFontSetDescriptor.fontSetId}.`
      );
    }

    ensureFileExists(this.baseFontSetDescriptor.cssAbsolutePath, 'Base fonts CSS artifact', {
      fontSetId: this.baseFontSetDescriptor.fontSetId,
      relativePath: this.baseFontSetDescriptor.cssRelativePath
    });

    return resolveTextArtifact(
      this.baseFontSetDescriptor.cssAbsolutePath,
      this.baseFontSetDescriptor.cssRelativePath
    );
  }

  readBaseFontFileArtifact(fileId: string): ResolvedArtifactBinary {
    const descriptor = this.findBaseFontFileDescriptor(fileId);

    if (!descriptor) {
      throw new Error(`Unknown base font fileId "${fileId}".`);
    }

    ensureFileExists(descriptor.absolutePath, 'Base font file artifact', {
      fileId: descriptor.fileId,
      relativePath: descriptor.relativePath
    });

    return resolveBinaryArtifact(descriptor.absolutePath, descriptor.relativePath);
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
