import { readJson } from './file-io.js';
import { COLLECTION_NAME, SNAPSHOT_SCHEMA_VERSION } from './snapshot-schema.js';

function assertObject(value, message) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(message);
  }
}

function assertString(value, message) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(message);
  }
}

export function normalizeSnapshot(snapshot) {
  assertObject(snapshot, 'Snapshot file must contain a JSON object.');

  if (snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    throw new Error(`Snapshot schemaVersion must be ${SNAPSHOT_SCHEMA_VERSION}.`);
  }

  assertObject(snapshot.source, 'Snapshot source must be an object.');
  assertObject(snapshot.collection, 'Snapshot collection must be an object.');

  const collection = snapshot.collection;
  assertString(collection.id, 'Snapshot collection.id must be a non-empty string.');
  assertString(collection.name, 'Snapshot collection.name must be a non-empty string.');

  if (collection.name !== COLLECTION_NAME) {
    throw new Error(`Snapshot collection.name must be \"${COLLECTION_NAME}\".`);
  }

  if (!Array.isArray(collection.variables)) {
    throw new Error('Snapshot collection.variables must be an array.');
  }

  const variables = collection.variables.map((variable) => {
    assertObject(variable, 'Each snapshot variable must be an object.');
    assertString(variable.id, 'Snapshot variable.id must be a non-empty string.');
    assertString(variable.name, 'Snapshot variable.name must be a non-empty string.');
    assertString(variable.resolvedType, 'Snapshot variable.resolvedType must be a non-empty string.');
    return {
      id: variable.id,
      name: variable.name,
      resolvedType: variable.resolvedType
    };
  });

  return {
    schemaVersion: SNAPSHOT_SCHEMA_VERSION,
    contentHash: typeof snapshot.contentHash === 'string' ? snapshot.contentHash : '',
    source: {
      transport: String(snapshot.source.transport ?? ''),
      serverName: String(snapshot.source.serverName ?? ''),
      toolName: String(snapshot.source.toolName ?? ''),
      collectionName: String(snapshot.source.collectionName ?? '')
    },
    collection: {
      id: collection.id,
      name: collection.name,
      variables
    }
  };
}

export async function readSnapshotFile(snapshotPath) {
  try {
    const parsed = await readJson(snapshotPath);
    return normalizeSnapshot(parsed);
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      throw new Error(
        `Snapshot file not found: ${snapshotPath}. Run ` +
          `"pnpm --filter @prism/ui-core figma:extract -- --file-url <figma-url>" ` +
          'or pass --snapshot <path>.'
      );
    }

    throw error;
  }
}
