import { access, readFile } from 'node:fs/promises';

import { COLLECTION_NAME } from './snapshot-schema.js';
import { writeStableJson } from './file-io.js';

const MAP_SCHEMA_VERSION = 1;

function compareStrings(left, right) {
  return left.localeCompare(right);
}

export function createEmptyMapping() {
  return {
    schemaVersion: MAP_SCHEMA_VERSION,
    collectionName: COLLECTION_NAME,
    mappings: {}
  };
}

function assertObject(value, message) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(message);
  }
}

export function normalizeMapping(mapping) {
  assertObject(mapping, 'Mapping file must contain a JSON object at the top level.');

  const schemaVersion = mapping.schemaVersion;
  const collectionName = mapping.collectionName;
  const mappings = mapping.mappings;

  if (schemaVersion !== MAP_SCHEMA_VERSION) {
    throw new Error(`Mapping schemaVersion must be ${MAP_SCHEMA_VERSION}.`);
  }

  if (collectionName !== COLLECTION_NAME) {
    throw new Error(`Mapping collectionName must be \"${COLLECTION_NAME}\".`);
  }

  assertObject(mappings, 'Mapping file field \"mappings\" must be an object.');

  const normalizedMappings = {};

  for (const variableId of Object.keys(mappings).sort(compareStrings)) {
    const repoTokenKey = mappings[variableId];

    if (typeof variableId !== 'string' || variableId.length === 0) {
      throw new Error('Mapping variableId keys must be non-empty strings.');
    }

    if (typeof repoTokenKey !== 'string' || repoTokenKey.length === 0) {
      throw new Error(`Mapping value for variableId \"${variableId}\" must be a non-empty string.`);
    }

    normalizedMappings[variableId] = repoTokenKey;
  }

  return {
    schemaVersion: MAP_SCHEMA_VERSION,
    collectionName: COLLECTION_NAME,
    mappings: normalizedMappings
  };
}

export async function readMappingFile(mappingPath) {
  try {
    await access(mappingPath);
  } catch {
    return createEmptyMapping();
  }

  const raw = await readFile(mappingPath, 'utf8');
  const parsed = JSON.parse(raw);
  return normalizeMapping(parsed);
}

export async function writeMappingFile(mappingPath, mapping) {
  const normalized = normalizeMapping(mapping);
  await writeStableJson(mappingPath, normalized);
  return normalized;
}
