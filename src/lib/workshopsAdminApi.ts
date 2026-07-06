import { ApiError } from './api';
import { getSessionUserEmail } from './authRouting';

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
  if (!API_BASE) return normalizedPath;
  return `${API_BASE}${normalizedPath}`;
}

async function parseErrorResponse(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
  } catch {
    /* ignore */
  }
  return `Error del servidor (${res.status})`;
}

function adminJsonHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const email = getSessionUserEmail();
  if (email) headers['X-Actor-Email'] = email;
  return headers;
}

export interface AdminWorkshop {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  active: boolean;
  userId: string | null;
  loginEmail: string | null;
  createdAt: string;
}

export interface CreateAdminWorkshopInput {
  name: string;
  address: string;
  city: string;
  email: string;
  password?: string;
  phone?: string;
}

export interface CreateAdminWorkshopResult extends AdminWorkshop {
  initialPassword: string;
  portalPath: string;
}

export async function adminFetchWorkshops(): Promise<AdminWorkshop[]> {
  const res = await fetch(apiUrl('/api/v1/admin/workshops'), {
    headers: adminJsonHeaders(),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as AdminWorkshop[];
}

export async function adminCreateWorkshop(
  input: CreateAdminWorkshopInput,
): Promise<CreateAdminWorkshopResult> {
  const res = await fetch(apiUrl('/api/v1/admin/workshops'), {
    method: 'POST',
    headers: adminJsonHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as CreateAdminWorkshopResult;
}

export async function adminUpdateWorkshop(
  workshopId: string,
  input: Partial<{
    name: string;
    address: string;
    city: string;
    phone: string | null;
    active: boolean;
  }>,
): Promise<AdminWorkshop> {
  const res = await fetch(apiUrl(`/api/v1/admin/workshops/${encodeURIComponent(workshopId)}`), {
    method: 'PATCH',
    headers: adminJsonHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as AdminWorkshop;
}
