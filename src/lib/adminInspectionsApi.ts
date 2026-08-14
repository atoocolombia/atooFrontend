import { ApiError } from './api';
import { fetchWithCreds, apiUrl, parseErrorResponse } from './http';
import type { ProcedureSuggestionStatus } from './inspectionsApi';


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
  const res = await fetchWithCreds(
    apiUrl(`/api/v1/admin/inspections/procedure-suggestions?status=${encodeURIComponent(status)}`),
    { headers: { 'Content-Type': 'application/json' } },
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
  const res = await fetchWithCreds(
    apiUrl(`/api/v1/admin/inspections/procedure-suggestions/${encodeURIComponent(suggestionId)}`),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as AdminProcedureSuggestion;
}

export async function adminFetchNotifications(): Promise<AdminNotificationItem[]> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/inspections/notifications'), {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as AdminNotificationItem[];
}

export async function adminMarkNotificationRead(notificationId: string): Promise<void> {
  const res = await fetchWithCreds(
    apiUrl(`/api/v1/admin/inspections/notifications/${encodeURIComponent(notificationId)}/read`),
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' } },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
}
