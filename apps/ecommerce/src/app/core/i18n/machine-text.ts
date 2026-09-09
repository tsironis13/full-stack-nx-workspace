const MACHINE_KEY = /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$/;

export function encodeMachineText(
  key: string,
  params?: Record<string, unknown>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return key;
  }
  return `${key}|${JSON.stringify(params)}`;
}

export function decodeMachineText(
  raw: string,
): { key: string; params?: Record<string, unknown> } | null {
  const sep = raw.indexOf('|');
  const key = sep === -1 ? raw : raw.slice(0, sep);
  if (!MACHINE_KEY.test(key)) {
    return null;
  }
  if (sep === -1) {
    return { key };
  }
  try {
    const params = JSON.parse(raw.slice(sep + 1)) as Record<string, unknown>;
    return { key, params };
  } catch {
    return { key };
  }
}

export function localizeMachineText(
  raw: string,
  translate: (key: string, params?: Record<string, unknown>) => string,
): string {
  const decoded = decodeMachineText(raw);
  if (!decoded) {
    return raw;
  }
  return translate(decoded.key, decoded.params);
}

export function localizeA2uiValue(
  value: unknown,
  translate: (key: string, params?: Record<string, unknown>) => string,
): unknown {
  if (typeof value === 'string') {
    return localizeMachineText(value, translate);
  }
  if (Array.isArray(value)) {
    return value.map((item) => localizeA2uiValue(item, translate));
  }
  if (value !== null && typeof value === 'object') {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(
      value as Record<string, unknown>,
    )) {
      next[key] = localizeA2uiValue(nested, translate);
    }
    return next;
  }
  return value;
}
