export const isDeepEmpty = (
  value: string | object | Array<unknown>
): boolean => {
  // null or undefined
  if (value == null) return true;

  // empty or whitespace-only string
  if (typeof value === 'string' && value.trim() === '') return true;

  // arrays
  if (Array.isArray(value)) {
    return value.length === 0 || value.every(isDeepEmpty);
  }

  // objects
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    return entries.length === 0 || entries.every(([_, v]) => isDeepEmpty(v));
  }

  // any other primitive (number, boolean, etc.) is NOT empty
  return false;
};
