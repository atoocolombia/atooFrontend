import { apiFetch, parseErrorResponse } from './http';
import type { SupportChatSessionDto } from './supportChatApi';

export const EMERGENCY_TOPIC_ID = 5;

export type EmergencyContact = {
  name: string;
  number: string;
  detail: string;
};

export type EmergencyInfo = {
  safetySteps: string[];
  contacts: EmergencyContact[];
  businessHoursNote: string;
};

export const EMERGENCY_SITUATIONS = [
  { id: 'accidente', label: 'Accidente de tránsito' },
  { id: 'falla', label: 'Falla del vehículo / no arranca' },
  { id: 'incendio', label: 'Incendio, humo o riesgo de fuego' },
  { id: 'agua', label: 'Agua profunda / inundación' },
  { id: 'otro', label: 'Otra emergencia' },
] as const;

export async function fetchSupportEmergencyInfo(): Promise<EmergencyInfo> {
  const res = await apiFetch('/api/v1/support/chat/emergency-info');
  if (!res.ok) throw new Error('No se pudo cargar información de emergencia');
  return (await res.json()) as EmergencyInfo;
}

export function formatEmergencySafetyMessage(info: EmergencyInfo): string {
  const steps = info.safetySteps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const phones = info.contacts
    .map((c) => `• **${c.name}:** ${c.number} — ${c.detail}`)
    .join('\n');
  return [
    '🆘 **Prioridad: tu salud y la de los demás**',
    '',
    steps,
    '',
    '**Contactos de emergencia (Bogotá / Colombia):**',
    phones,
    '',
    info.businessHoursNote,
  ].join('\n');
}

export async function reportSupportEmergency(payload: {
  sessionId?: string;
  situation: string;
  location: string;
  description: string;
  clientSafe: boolean;
}): Promise<SupportChatSessionDto> {
  const reportRes = await apiFetch('/api/v1/support/chat/emergency-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await reportRes.json().catch(() => ({}))) as {
    error?: string;
    session?: SupportChatSessionDto;
  };
  if (!reportRes.ok) throw new Error(body.error ?? (await parseErrorResponse(reportRes)));
  if (!body.session) throw new Error('No se recibió la conversación actualizada');
  return body.session;
}
