import { ApiError } from './api';

/** Normaliza VITE_API_URL: protocolo https, sin barra final ni sufijos /api duplicados. */
function normalizeApiBase(raw: string): string {
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

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL ?? '');

function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) {
    return normalizedPath;
  }
  return `${API_BASE}${normalizedPath}`;
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  } catch {
    // ignore
  }
  return `Error del servidor (${res.status})`;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  initials: string;
  address: string;
  idDocumentNumber: string;
  phone: string;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  if (!API_BASE) {
    throw new ApiError(
      'No está configurada la URL del API. Define VITE_API_URL en Vercel o en frontend/.env.',
      0,
    );
  }

  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/profile`);

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión o la configuración del API.',
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }

  return (await res.json()) as UserProfile;
}
