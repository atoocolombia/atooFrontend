import { apiFetch } from './http';

export interface ClientPaymentRecord {
  id: string;
  idDocumentNumber: string;
  amountCop: number;
  paidAt: string;
  clientName: string | null;
  notes: string | null;
  userId: string | null;
  registeredByUserId: string;
  createdAt: string;
}

export async function fetchAnalystPayments(idDocumentNumber?: string): Promise<ClientPaymentRecord[]> {
  const query = idDocumentNumber?.trim()
    ? `?idDocumentNumber=${encodeURIComponent(idDocumentNumber.trim())}`
    : '';
  const res = await apiFetch(`/api/v1/analyst/payments${query}`);
  if (!res.ok) throw new Error('No se pudieron cargar los pagos');
  return res.json();
}

export async function registerAnalystPayment(payload: {
  idDocumentNumber: string;
  amountCop: number;
  paidAt: string;
  notes?: string;
}): Promise<ClientPaymentRecord> {
  const res = await apiFetch('/api/v1/analyst/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as ClientPaymentRecord & { error?: string };
  if (!res.ok) throw new Error(body.error ?? 'No se pudo registrar el pago');
  return body;
}

export function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatPaymentDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function toDateTimeLocalValue(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
