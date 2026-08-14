import { ApiError } from './api';
import { fetchWithCreds, apiUrl, parseErrorResponse } from './http';


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
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/workshops'), {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as AdminWorkshop[];
}

export async function adminCreateWorkshop(
  input: CreateAdminWorkshopInput,
): Promise<CreateAdminWorkshopResult> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/workshops'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetchWithCreds(apiUrl(`/api/v1/admin/workshops/${encodeURIComponent(workshopId)}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as AdminWorkshop;
}
