import { ApiError } from './api';
import type {
  InspectionAppointment,
  InspectionAppointmentStatus,
  WorkshopAvailabilitySlot,
} from './inspectionsApi';

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

export interface WorkshopPortalSummary {
  workshop: {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string | null;
  };
  pendingRequests: number;
  appointmentsToday: number;
  upcomingAvailabilityDays: number;
}

export interface WorkshopNotification {
  id: string;
  type: 'planned' | 'request' | 'reschedule_counter';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface WorkshopInspectionAppointment extends InspectionAppointment {
  clientEmail?: string;
  clientDisplayName?: string;
}

function workshopBase(userId: string, suffix: string): string {
  return apiUrl(`/api/v1/workshop/${encodeURIComponent(userId)}${suffix}`);
}

export async function fetchWorkshopSummary(userId: string): Promise<WorkshopPortalSummary> {
  const res = await fetch(workshopBase(userId, '/summary'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopPortalSummary;
}

export async function fetchWorkshopAppointments(
  userId: string,
): Promise<WorkshopInspectionAppointment[]> {
  const res = await fetch(workshopBase(userId, '/appointments'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopInspectionAppointment[];
}

export async function updateWorkshopAppointmentStatus(
  userId: string,
  appointmentId: string,
  status: InspectionAppointmentStatus,
  workshopNotes?: string,
): Promise<WorkshopInspectionAppointment> {
  const res = await fetch(workshopBase(userId, `/appointments/${encodeURIComponent(appointmentId)}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, workshopNotes }),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopInspectionAppointment;
}

export async function rescheduleWorkshopAppointment(
  userId: string,
  appointmentId: string,
  input: { appointmentDate: string; appointmentTime: string; note?: string },
): Promise<WorkshopInspectionAppointment> {
  const res = await fetch(
    workshopBase(userId, `/appointments/${encodeURIComponent(appointmentId)}/reschedule`),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopInspectionAppointment;
}

export async function fetchWorkshopAvailability(
  userId: string,
): Promise<WorkshopAvailabilitySlot[]> {
  const res = await fetch(workshopBase(userId, '/availability'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopAvailabilitySlot[];
}

export async function createWorkshopAvailabilitySlot(
  userId: string,
  input: {
    date: string;
    startTime: string;
    endTime: string;
    maxAppointments: number;
  },
): Promise<WorkshopAvailabilitySlot> {
  const res = await fetch(workshopBase(userId, '/availability'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopAvailabilitySlot;
}

export async function updateWorkshopAvailabilitySlot(
  userId: string,
  slotId: string,
  input: Partial<{
    startTime: string;
    endTime: string;
    maxAppointments: number;
  }>,
): Promise<WorkshopAvailabilitySlot> {
  const res = await fetch(workshopBase(userId, `/availability/${encodeURIComponent(slotId)}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopAvailabilitySlot;
}

export async function deleteWorkshopAvailabilitySlot(
  userId: string,
  slotId: string,
): Promise<void> {
  const res = await fetch(workshopBase(userId, `/availability/${encodeURIComponent(slotId)}`), {
    method: 'DELETE',
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
}

export async function fetchWorkshopNotifications(
  userId: string,
): Promise<WorkshopNotification[]> {
  const res = await fetch(workshopBase(userId, '/notifications'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as WorkshopNotification[];
}

export function workshopProofUrl(userId: string, appointmentId: string): string {
  return workshopBase(userId, `/appointments/${encodeURIComponent(appointmentId)}/proof`);
}
