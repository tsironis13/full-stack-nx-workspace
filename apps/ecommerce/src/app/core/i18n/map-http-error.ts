import { HttpErrorResponse } from '@angular/common/http';

export const GENERIC_ERROR_KEY = 'errors.generic';

export const HTTP_STATUS_MESSAGE_KEYS: Readonly<Record<number, string>> = {
  401: 'errors.http.401',
  403: 'errors.http.403',
  404: 'errors.http.404',
  409: 'errors.http.409',
  422: 'errors.http.422',
  503: 'errors.http.503',
};

export type MappedMachineMessage = {
  key: string;
  params?: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function readCode(body: unknown): string | undefined {
  const rec = asRecord(body);
  const code = rec?.['code'];
  return typeof code === 'string' && code.length > 0 ? code : undefined;
}

function readParams(body: unknown): Record<string, unknown> | undefined {
  const rec = asRecord(body);
  const params = rec?.['params'];
  const parsed = asRecord(params);
  return parsed ?? undefined;
}

/**
 * Body message code, then known HTTP status, then generic.
 * Never returns a raw server string.
 */
export function mapHttpErrorToTranslocoKey(
  err: unknown,
): MappedMachineMessage {
  const http = err instanceof HttpErrorResponse ? err : null;
  const body = http?.error;
  const code = readCode(body);
  if (code) {
    return { key: code, params: readParams(body) };
  }
  if (http) {
    const statusKey = HTTP_STATUS_MESSAGE_KEYS[http.status];
    if (statusKey) {
      return { key: statusKey };
    }
  }
  return { key: GENERIC_ERROR_KEY };
}
