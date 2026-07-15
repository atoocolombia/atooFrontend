import { ApiError } from './api';

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
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULE_PENDING';

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
  const res = await fetch(url);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const data = await res.json();
  return data as VehicleInspectionPlan | null;
}

export async function fetchWorkshops(userId: string): Promise<WorkshopSummary[]> {
  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/inspections/workshops`);
  const res = await fetch(url);
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
  const res = await fetch(url);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopAvailabilitySlot[];
}

export async function fetchInspectionAppointments(
  userId: string,
): Promise<InspectionAppointment[]> {
  const url = apiUrl(`/api/v1/users/${encodeURIComponent(userId)}/inspections/appointments`);
  const res = await fetch(url);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as InspectionAppointment[];
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
  const res = await fetch(url, { method: 'POST', body: form });
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
  const res = await fetch(inspectionsBase(userId, '/notifications'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as UserNotificationItem[];
}

export async function markInspectionNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const res = await fetch(
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
  const res = await fetch(
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
