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

export type UserType = 'USER' | 'ADVISOR' | 'ADMIN' | 'ANALYST';

export interface RegisteredUser {
  id: string;
  email: string;
  userType: UserType;
  createdAt: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (typeof data.error === 'string' && data.error.trim()) {
      return data.error;
    }
  } catch {
    // ignore JSON parse errors
  }
  return `Error del servidor (${res.status})`;
}

export async function registerUser(input: {
  email: string;
  password: string;
  userType?: UserType;
}): Promise<RegisteredUser> {
  if (!API_BASE) {
    throw new ApiError(
      'No está configurada la URL del API. Define VITE_API_URL en Vercel o en frontend/.env.',
      0,
    );
  }

  const url = apiUrl('/api/v1/auth/register');

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
        userType: input.userType ?? 'USER',
      }),
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión o la configuración del API.',
      0,
    );
  }

  if (!res.ok) {
    const hint =
      res.status === 404
        ? ` (URL llamada: ${url}. Revisa VITE_API_URL: debe ser https://atoobackend-production.up.railway.app sin /api al final.)`
        : '';
    throw new ApiError((await parseErrorResponse(res)) + hint, res.status);
  }

  return (await res.json()) as RegisteredUser;
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<RegisteredUser> {
  if (!API_BASE) {
    throw new ApiError(
      'No está configurada la URL del API. Define VITE_API_URL en Vercel o en frontend/.env.',
      0,
    );
  }

  const url = apiUrl('/api/v1/auth/login');

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
      }),
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión o la configuración del API.',
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }

  return (await res.json()) as RegisteredUser;
}

export async function authWithGoogle(credential: string): Promise<RegisteredUser> {
  if (!API_BASE) {
    throw new ApiError(
      'No está configurada la URL del API. Define VITE_API_URL en Vercel o en frontend/.env.',
      0,
    );
  }

  const url = apiUrl('/api/v1/auth/google');

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential,
        userType: 'USER',
      }),
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión o la configuración del API.',
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }

  return (await res.json()) as RegisteredUser;
}
