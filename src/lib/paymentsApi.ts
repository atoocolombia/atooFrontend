import { apiFetch } from './http';

export interface ClientPaymentRecord {
  id: string;
  idDocumentNumber: string;
  idDocumentType: string;
  amountCop: number;
  paidAt: string;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  clientAddress: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  payerName: string | null;
  notes: string | null;
  userId: string | null;
  registeredByUserId: string;
  registeredByEmail: string | null;
  createdAt: string;
}

export interface ClientPaymentLookup {
  userId: string | null;
  idDocumentNumber: string;
  idDocumentType: string;
  clientName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  source: 'user' | 'delivery';
}

export async function fetchAnalystPayments(idDocumentNumber?: string): Promise<ClientPaymentRecord[]> {
  const query = idDocumentNumber?.trim()
    ? `?idDocumentNumber=${encodeURIComponent(idDocumentNumber.trim())}`
    : '';
  const res = await apiFetch(`/api/v1/analyst/payments${query}`);
  if (!res.ok) throw new Error('No se pudieron cargar los pagos');
  return res.json();
}

export async function searchPaymentClients(query: string): Promise<ClientPaymentLookup[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const res = await apiFetch(`/api/v1/analyst/payments/clients/lookup?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('No se pudo buscar clientes');
  const body = (await res.json()) as { clients: ClientPaymentLookup[] };
  return body.clients ?? [];
}

export async function lookupClientByDocument(document: string): Promise<{
  idDocumentNumber: string;
  idDocumentType: string;
  clientName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  userId: string | null;
  found: boolean;
}> {
  const digits = document.replace(/\D/g, '');
  const res = await apiFetch(`/api/v1/analyst/payments/clients/by-document/${encodeURIComponent(digits)}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error ?? 'No se pudo consultar el cliente');
  return body as {
    idDocumentNumber: string;
    idDocumentType: string;
    clientName: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    userId: string | null;
    found: boolean;
  };
}

export async function registerAnalystPayment(payload: {
  idDocumentNumber: string;
  idDocumentType?: string;
  amountCop: number;
  paidAt: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  paymentMethod?: string;
  paymentReference?: string;
  payerName?: string;
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

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'transferencia', label: 'Transferencia bancaria' },
  { value: 'consignacion', label: 'Consignación / efectivo en banco' },
  { value: 'pse', label: 'PSE' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'otro', label: 'Otro' },
] as const;

export const ID_DOCUMENT_TYPES = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'NIT', label: 'NIT' },
  { value: 'PA', label: 'Pasaporte' },
] as const;
