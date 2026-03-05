import { suggestRepoTokenKeys } from './figma-name-mapping.js';

function sortByNameThenId(left, right) {
  return left.variableName.localeCompare(right.variableName) || left.variableId.localeCompare(right.variableId);
}

export function generateMappingSuggestions(snapshot, repoTokenKeys) {
  const suggestions = snapshot.collection.variables
    .map((variable) => {
      const result = suggestRepoTokenKeys(variable.name, repoTokenKeys);
      return {
        variableId: variable.id,
        variableName: variable.name,
        confidence: result.confidence,
        candidates: result.candidates
      };
    })
    .sort(sortByNameThenId);

  return suggestions;
}

export function applySuggestionWrites(options) {
  const {
    existingMapping,
    suggestions,
    overwrite = false
  } = options;

  const nextMappings = { ...existingMapping.mappings };
  let appliedCount = 0;

  for (const suggestion of suggestions) {
    if (suggestion.confidence !== 'high' || suggestion.candidates.length !== 1) {
      continue;
    }

    if (!overwrite && typeof nextMappings[suggestion.variableId] === 'string') {
      continue;
    }

    const candidate = suggestion.candidates[0];

    if (!candidate) {
      continue;
    }

    nextMappings[suggestion.variableId] = candidate.repoTokenKey;
    appliedCount += 1;
  }

  return {
    schemaVersion: existingMapping.schemaVersion,
    collectionName: existingMapping.collectionName,
    mappings: Object.fromEntries(
      Object.keys(nextMappings)
        .sort((left, right) => left.localeCompare(right))
        .map((variableId) => [variableId, nextMappings[variableId]])
    ),
    appliedCount
  };
}

export function summarizeSuggestions(suggestions) {
  const summary = {
    total: suggestions.length,
    high: 0,
    medium: 0,
    low: 0,
    exactSingleCandidate: 0,
    ambiguous: 0,
    unmatched: 0
  };

  for (const suggestion of suggestions) {
    summary[suggestion.confidence] += 1;

    if (suggestion.candidates.length === 0) {
      summary.unmatched += 1;
      continue;
    }

    if (suggestion.confidence === 'high' && suggestion.candidates.length === 1) {
      summary.exactSingleCandidate += 1;
      continue;
    }

    if (suggestion.candidates.length > 1) {
      summary.ambiguous += 1;
    }
  }

  return summary;
}
