import { apiFetch } from './http';

export type GeofenceExitRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type GeofenceExitRequest = {
  id: string;
  userId: string;
  status: GeofenceExitRequestStatus;
  reason: string;
  destination: string | null;
  requestedFrom: string | null;
  requestedUntil: string | null;
  reviewNotes: string | null;
  createdAt: string;
};

export async function fetchMyGeofenceExitRequests(): Promise<GeofenceExitRequest[]> {
  const res = await apiFetch('/api/v1/client/geofence-exit/requests');
  if (!res.ok) throw new Error('No se pudieron cargar las solicitudes');
  const body = (await res.json()) as { requests?: GeofenceExitRequest[] };
  return body.requests ?? [];
}

export async function submitGeofenceExitRequest(input: {
  reason: string;
  destination?: string;
  requestedFrom: string;
  requestedUntil: string;
}): Promise<GeofenceExitRequest> {
  const res = await apiFetch('/api/v1/client/geofence-exit/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo enviar la solicitud');
  }
  return res.json();
}

export type AnalystGeofenceRequest = GeofenceExitRequest & {
  clientName: string;
  email: string;
};

export async function fetchAnalystGeofenceRequests(
  status: GeofenceExitRequestStatus = 'PENDING',
): Promise<AnalystGeofenceRequest[]> {
  const res = await apiFetch(`/api/v1/analyst/geofence-exit/requests?status=${status}`);
  if (!res.ok) throw new Error('No se pudieron cargar solicitudes de geocerca');
  const body = (await res.json()) as { requests?: AnalystGeofenceRequest[] };
  return body.requests ?? [];
}

export async function reviewGeofenceExitRequest(
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
  reviewNotes?: string,
): Promise<void> {
  const res = await apiFetch(`/api/v1/analyst/geofence-exit/requests/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, reviewNotes }),
  });
  if (!res.ok) throw new Error('No se pudo actualizar la solicitud');
}
