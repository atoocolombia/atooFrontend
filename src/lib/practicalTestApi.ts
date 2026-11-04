import { apiFetch } from './http';
import type { PendingApplication } from './deliveriesApi';

export const BACKGROUND_CHECK_LINKS = [
  {
    id: 'judicial' as const,
    label: 'Antecedentes Judiciales',
    url: 'https://antecedentes.policia.gov.co:7005/WebJudicial/',
  },
  {
    id: 'procuraduria' as const,
    label: 'Antecedentes Procuraduría',
    url: 'https://www.procuraduria.gov.co/Pages/Generacion-de-antecedentes.aspx',
  },
  {
    id: 'simit' as const,
    label: 'Multas SIMIT',
    url: 'https://www.fcm.org.co/simit/#/home-public',
  },
];

export type BackgroundCheckId = (typeof BACKGROUND_CHECK_LINKS)[number]['id'];

export type WeeklyScheduleItem = {
  id?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
};

export type PracticalTestAppointmentCard = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  clientName: string;
  clientEmail: string;
  userId: string;
  applicationId: string;
  hasEvaluation: boolean;
  evaluation: {
    experienceScore: number | null;
    customerServiceScore: number | null;
    overallScore: number | null;
    submittedAt: string;
  } | null;
};

export type PracticalEvalQuestion = {
  id: string;
  text: string;
  options: string[];
  category: string;
};

export async function patchApplicationBackgroundChecks(
  applicationId: string,
  checks: Partial<Record<BackgroundCheckId, { approved?: boolean | null; comment?: string | null }>>,
): Promise<PendingApplication> {
  const res = await apiFetch(`/api/v1/analyst/applications/${applicationId}/background-checks`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checks),
  });
  if (!res.ok) throw new Error('No se pudieron guardar las revisiones');
  return res.json();
}

export async function enablePracticalTestScheduling(applicationId: string): Promise<PendingApplication> {
  const res = await apiFetch(`/api/v1/analyst/applications/${applicationId}/enable-practical-test`, {
    method: 'POST',
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo habilitar la cita');
  }
  return res.json();
}

export async function fetchAnalystWeeklySchedule(): Promise<WeeklyScheduleItem[]> {
  const res = await apiFetch('/api/v1/analyst/practical-test/weekly-schedule');
  if (!res.ok) throw new Error('No se pudo cargar el horario');
  return res.json();
}

export async function saveAnalystWeeklySchedule(items: WeeklyScheduleItem[]): Promise<WeeklyScheduleItem[]> {
  const res = await apiFetch('/api/v1/analyst/practical-test/weekly-schedule', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error('No se pudo guardar el horario');
  return res.json();
}

export async function fetchAnalystPracticalAppointments(from: string, to: string): Promise<PracticalTestAppointmentCard[]> {
  const q = new URLSearchParams({ from, to });
  const res = await apiFetch(`/api/v1/analyst/practical-test/appointments?${q}`);
  if (!res.ok) throw new Error('No se pudieron cargar las citas');
  return res.json();
}

export async function fetchPracticalEvaluationForm(): Promise<{ questions: PracticalEvalQuestion[] }> {
  const res = await apiFetch('/api/v1/analyst/practical-test/evaluation-form');
  if (!res.ok) throw new Error('No se pudo cargar el formulario');
  return res.json();
}

export async function submitPracticalEvaluation(
  appointmentId: string,
  answers: Record<string, string>,
  analystNotes?: string,
): Promise<void> {
  const res = await apiFetch(`/api/v1/analyst/practical-test/appointments/${appointmentId}/evaluation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, analystNotes }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo guardar la evaluación');
  }
}

export type PracticalTestClientState = {
  schedulingEnabled: boolean;
  appointment: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  } | null;
};

export async function fetchPracticalTestClientState(userId: string): Promise<PracticalTestClientState> {
  const res = await apiFetch(`/api/v1/users/${userId}/practical-test/state`);
  if (!res.ok) throw new Error('No se pudo cargar el estado');
  return res.json();
}

export type AvailableSlot = { date: string; startTime: string; endTime: string };

export async function fetchAvailablePracticalSlots(userId: string, from: string): Promise<AvailableSlot[]> {
  const q = new URLSearchParams({ from });
  const res = await apiFetch(`/api/v1/users/${userId}/practical-test/available-slots?${q}`);
  if (!res.ok) throw new Error('No se pudieron cargar horarios');
  return res.json();
}

export async function bookPracticalTestSlot(userId: string, slot: AvailableSlot): Promise<void> {
  const res = await apiFetch(`/api/v1/users/${userId}/practical-test/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slot),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? 'No se pudo agendar');
  }
}
