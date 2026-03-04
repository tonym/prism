function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toStableValue(value) {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => toStableValue(entry));
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort((left, right) => left.localeCompare(right));
    const entries = keys.map((key) => [key, toStableValue(value[key])]);
    return Object.fromEntries(entries);
  }

  throw new Error(`Unsupported value type for stable serialization: ${typeof value}`);
}

export function stableStringify(value) {
  return JSON.stringify(toStableValue(value));
}

export function stableStringifyPretty(value) {
  return `${JSON.stringify(toStableValue(value), null, 2)}\n`;
}
