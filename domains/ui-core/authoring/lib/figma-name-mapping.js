function toKebabCase(value) {
  return value
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function repoTokenKeyToFigmaSlug(repoTokenKey) {
  return repoTokenKey
    .split('.')
    .map((segment) => toKebabCase(segment))
    .join('-');
}

export function figmaVariableNameToSlug(variableName) {
  return variableName
    .trim()
    .toLowerCase()
    .replace(/^prism-/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildSlugIndex(repoTokenKeys) {
  const bySlug = new Map();

  for (const key of repoTokenKeys) {
    const slug = repoTokenKeyToFigmaSlug(key);
    const existing = bySlug.get(slug) ?? [];
    existing.push(key);
    bySlug.set(slug, existing);
  }

  return bySlug;
}

function scoreCandidate(variableSlug, candidateSlug) {
  if (variableSlug === candidateSlug) {
    return 1;
  }

  if (candidateSlug.startsWith(variableSlug) || variableSlug.startsWith(candidateSlug)) {
    return 0.65;
  }

  if (candidateSlug.includes(variableSlug) || variableSlug.includes(candidateSlug)) {
    return 0.45;
  }

  return 0;
}

export function suggestRepoTokenKeys(variableName, repoTokenKeys) {
  const variableSlug = figmaVariableNameToSlug(variableName);
  const bySlug = buildSlugIndex(repoTokenKeys);
  const exact = bySlug.get(variableSlug) ?? [];

  if (exact.length === 1) {
    return {
      confidence: 'high',
      variableSlug,
      candidates: [{ repoTokenKey: exact[0], score: 1, reason: 'exact_slug_match' }]
    };
  }

  if (exact.length > 1) {
    return {
      confidence: 'medium',
      variableSlug,
      candidates: exact
        .sort((left, right) => left.localeCompare(right))
        .map((repoTokenKey) => ({ repoTokenKey, score: 1, reason: 'ambiguous_exact_slug_match' }))
    };
  }

  const fuzzyCandidates = repoTokenKeys
    .map((repoTokenKey) => {
      const candidateSlug = repoTokenKeyToFigmaSlug(repoTokenKey);
      const score = scoreCandidate(variableSlug, candidateSlug);
      return { repoTokenKey, score, reason: 'fuzzy_slug_match' };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.repoTokenKey.localeCompare(right.repoTokenKey))
    .slice(0, 5);

  if (fuzzyCandidates.length === 0) {
    return {
      confidence: 'low',
      variableSlug,
      candidates: []
    };
  }

  return {
    confidence: fuzzyCandidates[0]?.score >= 0.65 ? 'medium' : 'low',
    variableSlug,
    candidates: fuzzyCandidates
  };
}
