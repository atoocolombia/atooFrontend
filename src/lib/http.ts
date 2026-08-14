import { assertOnlineForWrite } from './offline';

/** Normaliza VITE_API_URL: protocolo https, sin barra final ni sufijos /api duplicados. */
export function normalizeApiBase(raw: string): string {
  let base = raw
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/v1$/i, '')
    .replace(/\/api$/i, '');

  if (base && !/^https?:\/\//i.test(base)) {
    base = `https://${base}`;
  }

  return base;
}

export const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL ?? '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) return normalizedPath;
  return `${API_BASE}${normalizedPath}`;
}

export async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
  } catch {
    // ignore
  }
  return `Error del servidor (${res.status})`;
}

/** Fetch autenticado: envía cookie HttpOnly JWT y bloquea escrituras sin red. */
export async function fetchWithCreds(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  assertOnlineForWrite(init.method);
  return fetch(input, { ...init, credentials: 'include' });
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers ?? undefined);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetchWithCreds(apiUrl(path), {
    ...init,
    headers,
  });
}
