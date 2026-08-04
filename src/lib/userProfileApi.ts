import { ApiError } from './api';
import { apiFetch, API_BASE, parseErrorResponse } from './http';

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

  const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/profile`);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as UserProfile;
}
