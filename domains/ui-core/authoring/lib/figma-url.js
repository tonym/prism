const FIGMA_HOSTS = new Set(['figma.com', 'www.figma.com']);

function parseAndValidate(rawUrl) {
  if (typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
    throw new Error('The --file-url flag is required and must be a non-empty string.');
  }

  let parsed;

  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('Invalid --file-url value. Provide a valid Figma file URL.');
  }

  if (!FIGMA_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error(
      `Unsupported Figma host \"${parsed.hostname}\". Use a URL on figma.com (for example https://www.figma.com/design/<fileKey>/<fileName>).`
    );
  }

  const pathSegments = parsed.pathname.split('/').filter((segment) => segment.length > 0);

  if (pathSegments.length < 3 || pathSegments[0] !== 'design') {
    throw new Error(
      `Invalid Figma file URL path \"${parsed.pathname}\". Expected format: /design/<fileKey>/<fileName>.`
    );
  }

  const fileKey = pathSegments[1];

  if (!fileKey || fileKey.length < 6) {
    throw new Error('Invalid Figma file key in --file-url.');
  }

  return {
    parsed,
    fileKey
  };
}

export function validateFigmaFileUrl(rawUrl) {
  const { parsed } = parseAndValidate(rawUrl);

  // Normalize to canonical file URL without query/hash (node-id is not needed for variable extraction).
  parsed.search = '';
  parsed.hash = '';

  return parsed.toString();
}

export function extractFigmaFileKey(rawUrl) {
  const { fileKey } = parseAndValidate(rawUrl);
  return fileKey;
}
