import { apiFetch } from './http';

export type DeliveryStatus =
  | 'PENDING_DOCUMENTS'
  | 'DOCUMENTS_SENT'
  | 'DOCUMENTS_SIGNED'
  | 'IN_DELIVERY'
  | 'AWAITING_CLIENT_CONFIRMATION'
  | 'COMPLETED';

export interface AccessoryItem {
  key: string;
  label: string;
  delivered: boolean;
}

export interface VehicleDeliveryRecord {
  id: string;
  userId: string | null;
  applicationId: string | null;
  status: DeliveryStatus;
  clientName: string;
  idDocumentNumber: string;
  address: string | null;
  email: string;
  phone: string | null;
  deliveryLocation: string | null;
  documents: {
    contract: { sentAt: string | null; signedAt: string | null };
    insurance: { sentAt: string | null; signedAt: string | null };
    promissoryNote: { sentAt: string | null; signedAt: string | null };
  };
  vehicle: Record<string, string | null>;
  accessoryChecklist: AccessoryItem[];
  completedByAdvisorAt: string | null;
  clientConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PendingApplication {
  id: string;
  userId: string;
  status: string;
  submittedAt: string;
  clientName: string;
  idDocumentNumber: string | null;
  email: string;
  phone: string | null;
  address: string | null;
}

export async function fetchAdvisorDeliveries(): Promise<VehicleDeliveryRecord[]> {
  const res = await apiFetch('/api/v1/advisor/deliveries');
  if (!res.ok) throw new Error('No se pudieron cargar las entregas');
  return res.json();
}

export async function fetchAdvisorDelivery(id: string): Promise<VehicleDeliveryRecord> {
  const res = await apiFetch(`/api/v1/advisor/deliveries/${id}`);
  if (!res.ok) throw new Error('Entrega no encontrada');
  return res.json();
}

export async function sendDeliveryDocuments(id: string): Promise<VehicleDeliveryRecord> {
  const res = await apiFetch(`/api/v1/advisor/deliveries/${id}/send-documents`, { method: 'POST' });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudieron enviar los documentos');
  }
  return res.json();
}

export async function markDeliveryDocumentSigned(
  id: string,
  document: 'contract' | 'insurance' | 'promissoryNote' | 'all',
): Promise<VehicleDeliveryRecord> {
  const res = await apiFetch(`/api/v1/advisor/deliveries/${id}/mark-signed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo actualizar la firma');
  }
  return res.json();
}

export async function patchAdvisorDelivery(
  id: string,
  payload: Record<string, unknown>,
): Promise<VehicleDeliveryRecord> {
  const res = await apiFetch(`/api/v1/advisor/deliveries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo guardar la entrega');
  }
  return res.json();
}

export async function completeAdvisorDelivery(id: string): Promise<VehicleDeliveryRecord & { confirmUrl?: string }> {
  const res = await apiFetch(`/api/v1/advisor/deliveries/${id}/complete`, { method: 'POST' });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo completar la entrega');
  }
  return res.json();
}

export async function fetchPendingApplications(): Promise<PendingApplication[]> {
  const res = await apiFetch('/api/v1/analyst/applications');
  if (!res.ok) throw new Error('No se pudieron cargar las solicitudes');
  return res.json();
}

export async function approveApplication(applicationId: string) {
  const res = await apiFetch(`/api/v1/analyst/applications/${applicationId}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('No se pudo aprobar la solicitud');
  return res.json();
}

export async function rejectApplication(applicationId: string, reason?: string) {
  const res = await apiFetch(`/api/v1/analyst/applications/${applicationId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error('No se pudo rechazar la solicitud');
  return res.json();
}

export async function createManualDelivery(payload: {
  clientName: string;
  idDocumentNumber: string;
  address?: string;
  email: string;
  phone?: string;
  deliveryLocation?: string;
}): Promise<VehicleDeliveryRecord> {
  const res = await apiFetch('/api/v1/analyst/deliveries/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo crear la entrega manual');
  }
  return res.json();
}

export async function submitUserApplication(userId: string) {
  const res = await apiFetch(`/api/v1/users/${userId}/application/submit`, { method: 'POST' });
  if (!res.ok) throw new Error('No se pudo enviar la solicitud');
  return res.json();
}

export async function confirmDeliveryByToken(token: string) {
  const res = await apiFetch(`/api/v1/delivery-confirm/${token}`, { method: 'POST' });
  if (!res.ok) throw new Error('No se pudo confirmar la entrega');
  return res.json();
}

export async function fetchDeliveryConfirmPreview(token: string) {
  const res = await apiFetch(`/api/v1/delivery-confirm/${token}`);
  if (!res.ok) throw new Error('Enlace de confirmación inválido');
  return res.json();
}
