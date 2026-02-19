type PrimitiveValue = null | boolean | number | string;

type JsonLike = PrimitiveValue | JsonLike[] | { [key: string]: JsonLike };

function sortPlainRecord(value: { [key: string]: JsonLike }): { [key: string]: JsonLike } {
  const entries = Object.keys(value)
    .sort((left, right) => left.localeCompare(right))
    .map((key) => [key, normalize(value[key])]);

  return Object.fromEntries(entries);
}

function normalize(value: unknown): JsonLike {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalize(entry));
  }

  if (typeof value === 'object') {
    return sortPlainRecord(value as { [key: string]: JsonLike });
  }

  throw new Error(`Cannot serialize unsupported value type: ${typeof value}.`);
}

export function stableSerialize(value: unknown): string {
  return JSON.stringify(normalize(value));
}
