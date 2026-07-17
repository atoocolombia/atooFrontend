import { ApiError } from './api';
import { getSessionUserEmail } from './authRouting';
import type { ProcedureSuggestionStatus } from './inspectionsApi';

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

export interface AdminProcedureSuggestion {
  id: string;
  title: string;
  description: string | null;
  estimatedCostCop: number | null;
  isUrgent: boolean;
  status: ProcedureSuggestionStatus;
  adminNotes: string | null;
  reviewedAt: string | null;
  deadlineAt: string | null;
  createdAt: string;
  sessionId: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentTime: string | null;
  reason: string | null;
  workshopName: string;
  workshopCity: string;
  clientEmail: string;
  clientDisplayName: string;
}

export interface AdminNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

export async function adminFetchProcedureSuggestions(
  status: 'PENDING_ADMIN' | 'ALL' = 'PENDING_ADMIN',
): Promise<AdminProcedureSuggestion[]> {
  const res = await fetch(
    apiUrl(`/api/v1/admin/inspections/procedure-suggestions?status=${encodeURIComponent(status)}`),
    { headers: adminJsonHeaders() },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as AdminProcedureSuggestion[];
}

export async function adminReviewProcedureSuggestion(
  suggestionId: string,
  input: {
    action: 'approve' | 'reject';
    adminNotes?: string;
    estimatedCostCop?: number | null;
    isUrgent?: boolean;
  },
): Promise<AdminProcedureSuggestion> {
  const res = await fetch(
    apiUrl(`/api/v1/admin/inspections/procedure-suggestions/${encodeURIComponent(suggestionId)}`),
    {
      method: 'PATCH',
      headers: adminJsonHeaders(),
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as AdminProcedureSuggestion;
}

export async function adminFetchNotifications(): Promise<AdminNotificationItem[]> {
  const res = await fetch(apiUrl('/api/v1/admin/inspections/notifications'), {
    headers: adminJsonHeaders(),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as AdminNotificationItem[];
}

export async function adminMarkNotificationRead(notificationId: string): Promise<void> {
  const res = await fetch(
    apiUrl(`/api/v1/admin/inspections/notifications/${encodeURIComponent(notificationId)}/read`),
    { method: 'PATCH', headers: adminJsonHeaders() },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
}
