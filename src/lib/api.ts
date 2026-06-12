const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1/auth/register`, {
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
    throw new ApiError(await parseErrorResponse(res), res.status);
  }

  return (await res.json()) as RegisteredUser;
}
