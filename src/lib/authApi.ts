import { ApiError, type RegisteredUser, type UserType } from './api';
import { captureAuthTokenFromPayload, clearAuthToken } from './authTokenStorage';
import { apiFetch, isApiConfigured, parseErrorResponse } from './http';

export async function fetchAuthMe(): Promise<RegisteredUser> {
  if (!isApiConfigured()) {
    throw new ApiError('No está configurada la URL del API.', 0);
  }
  const res = await apiFetch('/api/v1/auth/me');
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const data = (await res.json()) as RegisteredUser & { token?: string };
  captureAuthTokenFromPayload(data);
  return {
    id: data.id,
    email: data.email,
    userType: data.userType,
    createdAt: data.createdAt,
  };
}

export async function logoutAuthSession(): Promise<void> {
  try {
    if (isApiConfigured()) {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' });
    }
  } catch {
    // ignore network errors on logout
  } finally {
    clearAuthToken();
  }
}

export async function updateAuthProfile(input: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
}): Promise<{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  initials: string;
  address: string;
  idDocumentNumber: string;
  phone: string;
}> {
  const res = await apiFetch('/api/v1/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return res.json();
}

export async function changeAuthPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const res = await apiFetch('/api/v1/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
}

export type { UserType };
