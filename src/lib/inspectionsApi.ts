import { ApiError } from './api';
import { fetchWithCreds } from './http';

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
    // ignore
  }
  return `Error del servidor (${res.status})`;
}

export interface VehicleInspectionPlan {
  vehicleName: string;
  vin: string | null;
  deliveredAt: string;
  nextInspectionDueAt: string;
}

export interface WorkshopSummary {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  openBooking: boolean;
  upcomingSlots: WorkshopAvailabilitySlot[];
}

export interface WorkshopAvailabilitySlot {
  id: string;
  workshopId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxAppointments: number;
  bookedCount: number;
  remainingCapacity: number;
}

export type InspectionAppointmentKind = 'BUSINESS_PLANNED' | 'CLIENT_REQUESTED';
export type InspectionAppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULE_PENDING';

export type ProcedureSuggestionStatus =
  | 'PENDING_ADMIN'
  | 'APPROVED_IMMEDIATE'
  | 'APPROVED_CLIENT_SCHEDULE'
  | 'REJECTED';

export interface InspectionChecklistItem {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  completed: boolean;
  completedAt: string | null;
}

export interface InspectionProcedureSuggestion {
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
}

export interface InspectionSession {
  id: string;
  appointmentId: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  reason: string | null;
  appointmentDate: string;
  appointmentTime: string | null;
  workshopName: string;
  vehicleName: string | null;
  vin: string | null;
  clientEmail: string | null;
  clientDisplayName: string | null;
  progress: {
    totalSteps: number;
    completedSteps: number;
    percent: number;
    currentStepTitle: string | null;
  };
  survey: InspectionSurvey | null;
  checklistItems: InspectionChecklistItem[];
  suggestions: InspectionProcedureSuggestion[];
}

export interface InspectionSurvey {
  id: string;
  status: 'PENDING' | 'SUBMITTED';
  rating: number | null;
  comment: string | null;
  submittedAt: string | null;
}

export interface InspectionHistoryItem {
  appointmentId: string;
  sessionId: string;
  completedAt: string | null;
  appointmentDate: string;
  appointmentTime: string | null;
  workshopName: string;
  workshopCity: string;
  reason: string | null;
  notes: string | null;
  vehicleName: string | null;
  vin: string | null;
  checklistSummary: { total: number; completed: number };
  procedures: Array<{
    id: string;
    title: string;
    status: ProcedureSuggestionStatus;
    estimatedCostCop: number | null;
    isUrgent: boolean;
  }>;
  survey: Omit<InspectionSurvey, 'id'> | null;
}

export interface ClientProcedureAction {
  id: string;
  title: string;
  description: string | null;
  estimatedCostCop: number | null;
  isUrgent: boolean;
  status: ProcedureSuggestionStatus;
  deadlineAt: string | null;
  reviewedAt: string | null;
  workshopName: string;
  workshopCity: string;
  appointmentId: string;
}

export interface InspectionAppointment {
  id: string;
  userId: string;
  workshopId: string;
  workshopName: string;
  workshopAddress: string;
  workshopCity: string;
  kind: InspectionAppointmentKind;
  status: InspectionAppointmentStatus;
  appointmentDate: string;
  appointmentTime: string | null;
  proposedAppointmentDate: string | null;
  proposedAppointmentTime: string | null;
  rescheduleInitiatedBy: string | null;
  reason: string | null;
  proofOriginalName: string | null;
  workshopNotes: string | null;
  vehicleName: string | null;
  vin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
}

export async function fetchVehicleInspectionPlan(
  userId: string,
): Promise<VehicleInspectionPlan | null> {
  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/inspections/vehicle-plan`);
  const res = await fetchWithCreds(url);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const data = await res.json();
  return data as VehicleInspectionPlan | null;
}

export async function fetchWorkshops(userId: string): Promise<WorkshopSummary[]> {
  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/inspections/workshops`);
  const res = await fetchWithCreds(url);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopSummary[];
}

export async function fetchWorkshopSlots(
  userId: string,
  workshopId: string,
): Promise<WorkshopAvailabilitySlot[]> {
  const url = apiUrl(
    `/api/v1/users/${encodeURIComponent(userId)}/inspections/workshops/${encodeURIComponent(workshopId)}/slots`,
  );
  const res = await fetchWithCreds(url);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopAvailabilitySlot[];
}

export async function fetchInspectionAppointments(
  userId: string,
): Promise<InspectionAppointment[]> {
  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/inspections/appointments`);
  const res = await fetchWithCreds(url);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as InspectionAppointment[];
}

export async function fetchInspectionHistory(
  userId: string,
): Promise<InspectionHistoryItem[]> {
  const res = await fetchWithCreds(
    apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/inspections/history`),
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as InspectionHistoryItem[];
}

export async function fetchClientInspectionSession(
  userId: string,
  appointmentId: string,
): Promise<InspectionSession> {
  const res = await fetchWithCreds(
    apiUrl(
      `/api/v1/users/${encodeURIComponent(userId)}/inspections/appointments/${encodeURIComponent(appointmentId)}/session`,
    ),
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as InspectionSession;
}

export async function submitInspectionSurvey(
  userId: string,
  appointmentId: string,
  input: { rating: number; comment?: string },
): Promise<InspectionSurvey> {
  const res = await fetchWithCreds(
    apiUrl(
      `/api/v1/users/${encodeURIComponent(userId)}/inspections/appointments/${encodeURIComponent(appointmentId)}/survey`,
    ),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as InspectionSurvey;
}

export async function requestInspectionAppointment(
  userId: string,
  input: {
    workshopId: string;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
    proof: File;
  },
): Promise<InspectionAppointment> {
  const form = new FormData();
  form.append('workshopId', input.workshopId);
  form.append('appointmentDate', input.appointmentDate);
  form.append('appointmentTime', input.appointmentTime);
  form.append('reason', input.reason);
  form.append('proof', input.proof);

  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/inspections/appointments`);
  const res = await fetchWithCreds(url, { method: 'POST', body: form });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as InspectionAppointment;
}

export function inspectionProofUrl(userId: string, appointmentId: string): string {
  return apiUrl(
    `/api/v1/users/${encodeURIComponent(userId)}/inspections/appointments/${encodeURIComponent(appointmentId)}/proof`,
  );
}

function inspectionsBase(userId: string, suffix: string): string {
  return apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/inspections${suffix}`);
}

export async function fetchInspectionNotifications(
  userId: string,
): Promise<UserNotificationItem[]> {
  const res = await fetchWithCreds(inspectionsBase(userId, '/notifications'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as UserNotificationItem[];
}

export async function markInspectionNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const res = await fetchWithCreds(
    inspectionsBase(userId, `/notifications/${encodeURIComponent(notificationId)}/read`),
    { method: 'PATCH' },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
}

export async function respondToReschedule(
  userId: string,
  appointmentId: string,
  input:
    | { action: 'accept' }
    | { action: 'counter'; appointmentDate: string; appointmentTime: string },
): Promise<InspectionAppointment> {
  const res = await fetchWithCreds(
    inspectionsBase(userId, `/appointments/${encodeURIComponent(appointmentId)}/reschedule-response`),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as InspectionAppointment;
}

export async function fetchClientProcedureActions(
  userId: string,
): Promise<ClientProcedureAction[]> {
  const res = await fetchWithCreds(inspectionsBase(userId, '/procedure-actions'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as ClientProcedureAction[];
}
