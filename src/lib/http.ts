import { assertOnlineForWrite } from './offline';
import { getAuthToken } from './authTokenStorage';

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

function isSameOriginApiHost(hostname: string): boolean {
  return (
    hostname === 'atoo.io' ||
    hostname === 'www.atoo.io' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1'
  );
}

/**
 * En atoo.io y localhost las llamadas van al mismo origen (/api),
 * para que la cookie JWT sea de primera parte (Safari/iOS no envía cookies de terceros).
 * En previews de Vercel se usa VITE_API_URL (Railway) y el Bearer del login.
 */
export function getApiBase(): string {
  if (typeof window !== 'undefined' && isSameOriginApiHost(window.location.hostname)) {
    return '';
  }
  return normalizeApiBase(import.meta.env.VITE_API_URL ?? '');
}

export function isApiConfigured(): boolean {
  if (getApiBase()) return true;
  if (typeof window === 'undefined') return false;
  return isSameOriginApiHost(window.location.hostname);
}

/** @deprecated Prefer getApiBase(); vacío significa mismo origen, no “sin API”. */
export const API_BASE = getApiBase();

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBase();
  if (!base) return normalizedPath;
  return `${base}${normalizedPath}`;
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

/** Fetch autenticado: cookie HttpOnly + Bearer (Safari bloquea cookies de terceros). */
export async function fetchWithCreds(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  assertOnlineForWrite(init.method);
  const headers = new Headers(init.headers ?? undefined);
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, credentials: 'include', headers });
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
