import { extractFigmaFileKey } from './figma-url.js';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function buildAuthHeaders(accessToken) {
  if (accessToken.startsWith('figu_')) {
    return {
      Authorization: `Bearer ${accessToken}`
    };
  }

  return {
    'X-Figma-Token': accessToken
  };
}

function normalizeCollectionMap(rawCollections) {
  if (Array.isArray(rawCollections)) {
    return rawCollections;
  }

  if (!isObject(rawCollections)) {
    return [];
  }

  return Object.entries(rawCollections).map(([id, collection]) => ({
    id,
    ...(isObject(collection) ? collection : {})
  }));
}

function normalizeVariableMap(rawVariables) {
  if (Array.isArray(rawVariables)) {
    return rawVariables;
  }

  if (!isObject(rawVariables)) {
    return [];
  }

  return Object.entries(rawVariables).map(([id, variable]) => ({
    id,
    ...(isObject(variable) ? variable : {})
  }));
}

function normalizeVariablesPayload(responseBody) {
  const payload = isObject(responseBody.meta) ? responseBody.meta : responseBody;

  if (!isObject(payload)) {
    throw new Error('Figma REST response body is not a JSON object.');
  }

  return {
    data: {
      variableCollections: normalizeCollectionMap(payload.variableCollections),
      variables: normalizeVariableMap(payload.variables)
    }
  };
}

function formatHttpError(endpoint, status, bodyText) {
  const compactBody = bodyText.replace(/\s+/g, ' ').trim().slice(0, 500);

  if (status === 403) {
    return (
      `Figma REST request failed with 403 on ${endpoint}. ` +
      'The token likely lacks Variables API access for this file/workspace. ' +
      `Response: ${compactBody || 'no body'}`
    );
  }

  return `Figma REST request failed with ${status} on ${endpoint}. Response: ${compactBody || 'no body'}`;
}

export async function fetchFigmaVariablesViaRest(options) {
  const { fileUrl, accessToken, timeoutMs = 120_000, onProgress } = options;
  const token = typeof accessToken === 'string' ? accessToken.trim() : '';

  if (token.length === 0) {
    throw new Error(
      'Missing Figma access token for REST extraction. Set FIGMA_ACCESS_TOKEN or pass --access-token.'
    );
  }

  const fileKey = extractFigmaFileKey(fileUrl);
  const endpoint = `/files/${fileKey}/variables/local`;
  const requestUrl = `${FIGMA_API_BASE}${endpoint}`;

  onProgress?.(`Requesting Figma REST variables from ${endpoint}...`);

  let response;

  try {
    response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...buildAuthHeaders(token)
      },
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Figma REST request to ${endpoint} failed before response: ${message}`);
  }

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(formatHttpError(endpoint, response.status, bodyText));
  }

  const responseBody = await response.json();
  return normalizeVariablesPayload(responseBody);
}
