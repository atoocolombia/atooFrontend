import { captureAuthTokenFromPayload } from './authTokenStorage';
import type { RegisteredUser } from './api';
import { apiFetch } from './http';

export type ClientPortalPhase = 'application' | 'waiting_delivery' | 'dashboard';

export interface ClientAccessState {
  phase: ClientPortalPhase;
  hasVehicleDelivered: boolean;
  applicationStatus: string | null;
  deliveryStatus: string | null;
  message: string;
}

export async function fetchClientAccess(userId: string): Promise<ClientAccessState> {
  const res = await apiFetch(`/api/v1/users/${userId}/client-access`);
  if (!res.ok) throw new Error('No se pudo verificar el acceso al portal');
  return res.json();
}

export interface AccountSetupPreview {
  email: string;
  clientName: string;
  alreadyActivated: boolean;
}

export async function fetchAccountSetupPreview(token: string): Promise<AccountSetupPreview> {
  const res = await apiFetch(`/api/v1/account-setup/${token}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'Enlace inválido o expirado');
  }
  return res.json();
}

export async function activateAccountWithPassword(token: string, password: string): Promise<RegisteredUser> {
  const res = await apiFetch(`/api/v1/account-setup/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    id?: string;
    email?: string;
    userType?: string;
    createdAt?: string;
    token?: string;
  };
  if (!res.ok) {
    throw new Error(body.error ?? 'No se pudo activar la cuenta');
  }
  captureAuthTokenFromPayload(body);
  return {
    id: body.id!,
    email: body.email!,
    userType: body.userType as RegisteredUser['userType'],
    createdAt: body.createdAt!,
  };
}
