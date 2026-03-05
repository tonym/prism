import { sha256 } from './hash.js';
import { stableStringify } from './stable-json.js';

export const SNAPSHOT_SCHEMA_VERSION = 1;
export const COLLECTION_NAME = 'Prism UI Core Tokens';

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sortByNameThenId(left, right) {
  const leftName = left.name ?? '';
  const rightName = right.name ?? '';
  return leftName.localeCompare(rightName) || (left.id ?? '').localeCompare(right.id ?? '');
}

function normalizeValue(value) {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeValue(entry));
  }

  if (isPlainObject(value)) {
    const sortedEntries = Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => [key, normalizeValue(value[key])]);

    return Object.fromEntries(sortedEntries);
  }

  return String(value);
}

function normalizeModes(rawModes) {
  if (!Array.isArray(rawModes)) {
    return [];
  }

  return rawModes
    .map((mode) => ({
      id: String(mode.id ?? ''),
      name: String(mode.name ?? '')
    }))
    .filter((mode) => mode.id.length > 0)
    .sort(sortByNameThenId);
}

function normalizeVariable(rawVariable) {
  const rawValuesByMode = isPlainObject(rawVariable.valuesByMode)
    ? rawVariable.valuesByMode
    : isPlainObject(rawVariable.values_by_mode)
      ? rawVariable.values_by_mode
      : {};

  const valuesByMode = {};

  for (const modeId of Object.keys(rawValuesByMode).sort((left, right) => left.localeCompare(right))) {
    valuesByMode[modeId] = normalizeValue(rawValuesByMode[modeId]);
  }

  const scopes = Array.isArray(rawVariable.scopes)
    ? [...rawVariable.scopes].map((scope) => String(scope)).sort((left, right) => left.localeCompare(right))
    : [];

  return {
    id: String(rawVariable.id ?? rawVariable.variableId ?? ''),
    name: String(rawVariable.name ?? ''),
    resolvedType: String(rawVariable.resolvedType ?? rawVariable.type ?? ''),
    description: rawVariable.description == null ? null : String(rawVariable.description),
    hiddenFromPublishing: Boolean(rawVariable.hiddenFromPublishing ?? false),
    scopes,
    valuesByMode
  };
}

function normalizeVariables(rawVariables) {
  if (!Array.isArray(rawVariables)) {
    return [];
  }

  return rawVariables
    .map((rawVariable) => normalizeVariable(rawVariable))
    .filter((variable) => variable.id.length > 0)
    .sort(sortByNameThenId);
}

function getCollectionsFromPayload(payload) {
  const root = isPlainObject(payload.data) ? payload.data : payload;

  if (!isPlainObject(root)) {
    throw new Error('Figma variables response must be a JSON object.');
  }

  if (Array.isArray(root.collections)) {
    return root.collections;
  }

  if (Array.isArray(root.variableCollections)) {
    return root.variableCollections;
  }

  if (isPlainObject(root.variableCollections)) {
    return Object.entries(root.variableCollections).map(([id, collection]) => ({
      id,
      ...(isPlainObject(collection) ? collection : {})
    }));
  }

  throw new Error('Figma variables response does not include collections in full format.');
}

function getVariablesForCollection(rootPayload, rawCollection) {
  if (Array.isArray(rawCollection.variables)) {
    return rawCollection.variables;
  }

  const root = isPlainObject(rootPayload.data) ? rootPayload.data : rootPayload;

  if (!isPlainObject(root) || !Array.isArray(root.variables)) {
    if (isPlainObject(root) && isPlainObject(root.variables)) {
      const mapEntries = Object.entries(root.variables).map(([id, variable]) => ({
        id,
        ...(isPlainObject(variable) ? variable : {})
      }));
      const collectionId = String(rawCollection.id ?? '');
      return mapEntries.filter((variable) => String(variable.variableCollectionId ?? '') === collectionId);
    }

    return [];
  }

  const collectionId = String(rawCollection.id ?? '');
  return root.variables.filter((variable) => String(variable.variableCollectionId ?? '') === collectionId);
}

function normalizeCollection(rootPayload, rawCollection) {
  const normalizedModes = normalizeModes(rawCollection.modes);
  const normalizedVariables = normalizeVariables(getVariablesForCollection(rootPayload, rawCollection));

  return {
    id: String(rawCollection.id ?? ''),
    name: String(rawCollection.name ?? ''),
    defaultModeId: String(rawCollection.defaultModeId ?? ''),
    modes: normalizedModes,
    variables: normalizedVariables
  };
}

export function normalizeFigmaVariablesPayload(payload) {
  const collections = getCollectionsFromPayload(payload)
    .map((rawCollection) => normalizeCollection(payload, rawCollection))
    .filter((collection) => collection.id.length > 0)
    .sort(sortByNameThenId);

  if (collections.length !== 1) {
    throw new Error(
      `Expected exactly 1 Figma variable collection; received ${collections.length}. ` +
        `Ensure the file contains only \"${COLLECTION_NAME}\" for this alignment workflow.`
    );
  }

  const [collection] = collections;

  if (!collection || collection.name !== COLLECTION_NAME) {
    throw new Error(
      `Expected Figma variable collection name \"${COLLECTION_NAME}\"; received \"${collection?.name ?? 'unknown'}\".`
    );
  }

  return { collection };
}

export function buildNormalizedSnapshot(payload, options = {}) {
  const normalized = normalizeFigmaVariablesPayload(payload);
  const transport = typeof options.transport === 'string' ? options.transport : 'mcp';

  const serverName =
    typeof options.serverName === 'string' && options.serverName.length > 0
      ? options.serverName
      : transport === 'rest'
        ? 'figma_rest'
        : 'figma_console';
  const toolName =
    typeof options.toolName === 'string' && options.toolName.length > 0
      ? options.toolName
      : transport === 'rest'
        ? 'files.variables.local'
        : 'figma_get_variables';

  const baseSnapshot = {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    source: {
      transport,
      serverName,
      toolName,
      collectionName: COLLECTION_NAME
    },
    collection: normalized.collection
  };

  const contentHash = sha256(stableStringify(baseSnapshot));

  return {
    ...baseSnapshot,
    contentHash
  };
}
