import { captureAuthTokenFromPayload } from './authTokenStorage';
import { apiFetch, isApiConfigured, parseErrorResponse } from './http';
import { OfflineError } from './offline';

export type UserType = 'USER' | 'ADVISOR' | 'ADMIN' | 'ANALYST' | 'WORKSHOP';

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

function ensureApiBase(): void {
  if (!isApiConfigured()) {
    throw new ApiError(
      'No está configurada la URL del API. Define VITE_API_URL en Vercel o en frontend/.env.',
      0,
    );
  }
}

function readAuthUser(data: RegisteredUser & { token?: string }): RegisteredUser {
  captureAuthTokenFromPayload(data);
  return {
    id: data.id,
    email: data.email,
    userType: data.userType,
    createdAt: data.createdAt,
  };
}

export async function registerUser(input: {
  email: string;
  password: string;
  userType?: UserType;
}): Promise<RegisteredUser> {
  ensureApiBase();

  let res: Response;
  try {
    res = await apiFetch('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
        // El backend fuerza USER; no se permiten roles privilegiados por registro público.
        userType: 'USER',
      }),
    });
  } catch (err) {
    if (err instanceof OfflineError) {
      throw new ApiError(err.message, 0);
    }
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión o la configuración del API.',
      0,
    );
  }

  if (!res.ok) {
    const hint =
      res.status === 404
        ? ' (Revisa VITE_API_URL: debe ser la URL base del backend sin /api al final.)'
        : '';
    throw new ApiError((await parseErrorResponse(res)) + hint, res.status);
  }

  return readAuthUser((await res.json()) as RegisteredUser & { token?: string });
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<RegisteredUser> {
  ensureApiBase();

  let res: Response;
  try {
    res = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email.trim(),
        password: input.password,
      }),
    });
  } catch (err) {
    if (err instanceof OfflineError) {
      throw new ApiError(err.message, 0);
    }
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión o la configuración del API.',
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }

  return readAuthUser((await res.json()) as RegisteredUser & { token?: string });
}

export async function authWithGoogle(credential: string): Promise<RegisteredUser> {
  ensureApiBase();

  let res: Response;
  try {
    res = await apiFetch('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        credential,
        userType: 'USER',
      }),
    });
  } catch (err) {
    if (err instanceof OfflineError) {
      throw new ApiError(err.message, 0);
    }
    throw new ApiError(
      'No se pudo conectar con el servidor. Revisa tu conexión o la configuración del API.',
      0,
    );
  }

  if (!res.ok) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }

  return readAuthUser((await res.json()) as RegisteredUser & { token?: string });
}
