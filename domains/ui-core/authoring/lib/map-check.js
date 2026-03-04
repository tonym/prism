export function buildAlignmentReport(options) {
  const { snapshot, mapping, repoTokenKeys } = options;

  const repoKeySet = new Set(repoTokenKeys);
  const snapshotVariables = [...snapshot.collection.variables]
    .map((variable) => ({ id: variable.id, name: variable.name }))
    .sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id));

  const snapshotVariableIdSet = new Set(snapshotVariables.map((variable) => variable.id));

  const mappingEntries = Object.keys(mapping.mappings)
    .sort((left, right) => left.localeCompare(right))
    .map((variableId) => ({
      variableId,
      repoTokenKey: mapping.mappings[variableId]
    }));

  const errors = [];
  const warnings = [];

  const invalidRepoTokenKeyMappings = mappingEntries
    .filter((entry) => !repoKeySet.has(entry.repoTokenKey))
    .map((entry) => ({ variableId: entry.variableId, repoTokenKey: entry.repoTokenKey }));

  if (invalidRepoTokenKeyMappings.length > 0) {
    errors.push({
      code: 'INVALID_REPO_TOKEN_KEY_REFERENCE',
      message: 'One or more mapping entries reference repo token keys that are not present in inferred token keys.',
      details: invalidRepoTokenKeyMappings
    });
  }

  const duplicateRepoAssignments = new Map();

  for (const entry of mappingEntries) {
    const assignments = duplicateRepoAssignments.get(entry.repoTokenKey) ?? [];
    assignments.push(entry.variableId);
    duplicateRepoAssignments.set(entry.repoTokenKey, assignments);
  }

  const duplicateRepoTokenAssignments = [...duplicateRepoAssignments.entries()]
    .filter(([, variableIds]) => variableIds.length > 1)
    .map(([repoTokenKey, variableIds]) => ({
      repoTokenKey,
      variableIds: [...variableIds].sort((left, right) => left.localeCompare(right))
    }))
    .sort((left, right) => left.repoTokenKey.localeCompare(right.repoTokenKey));

  if (duplicateRepoTokenAssignments.length > 0) {
    warnings.push({
      code: 'DUPLICATE_REPO_TOKEN_ASSIGNMENT',
      message: 'Multiple Figma variables map to the same repo token key.',
      details: duplicateRepoTokenAssignments
    });
  }

  const unmappedFigmaVariables = snapshotVariables.filter((variable) => mapping.mappings[variable.id] == null);

  if (unmappedFigmaVariables.length > 0) {
    warnings.push({
      code: 'UNMAPPED_FIGMA_VARIABLES',
      message: 'Figma variables exist in the snapshot without mapping entries.',
      details: unmappedFigmaVariables
    });
  }

  const mappedRepoTokenKeySet = new Set(mappingEntries.map((entry) => entry.repoTokenKey));
  const unmappedRepoTokenKeys = [...repoTokenKeys]
    .filter((repoTokenKey) => !mappedRepoTokenKeySet.has(repoTokenKey))
    .sort((left, right) => left.localeCompare(right));

  if (unmappedRepoTokenKeys.length > 0) {
    warnings.push({
      code: 'UNMAPPED_REPO_TOKEN_KEYS',
      message: 'Repo token keys exist without a mapped Figma variable.',
      details: unmappedRepoTokenKeys
    });
  }

  const staleMappingEntries = mappingEntries
    .filter((entry) => !snapshotVariableIdSet.has(entry.variableId))
    .sort((left, right) => left.variableId.localeCompare(right.variableId));

  if (staleMappingEntries.length > 0) {
    warnings.push({
      code: 'STALE_MAPPING_VARIABLE_IDS',
      message: 'Mapping entries reference variable IDs that are not present in the extracted snapshot.',
      details: staleMappingEntries
    });
  }

  return {
    schemaVersion: 1,
    snapshot: {
      collectionName: snapshot.collection.name,
      contentHash: snapshot.contentHash,
      variableCount: snapshotVariables.length
    },
    mapping: {
      entryCount: mappingEntries.length
    },
    repo: {
      tokenKeyCount: repoTokenKeys.length
    },
    summary: {
      errors: errors.length,
      warnings: warnings.length,
      invalidRepoTokenKeyMappings: invalidRepoTokenKeyMappings.length,
      unmappedFigmaVariables: unmappedFigmaVariables.length,
      unmappedRepoTokenKeys: unmappedRepoTokenKeys.length,
      staleMappingEntries: staleMappingEntries.length
    },
    errors,
    warnings
  };
}

export function assertNoStructuralErrors(report) {
  if (report.errors.length > 0) {
    const firstError = report.errors[0];
    throw new Error(`Alignment check failed: ${firstError?.message ?? 'unknown structural error'}`);
  }
}
