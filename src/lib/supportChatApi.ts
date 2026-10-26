import { apiFetch, parseErrorResponse } from './http';

export interface SupportTopic {
  id: number;
  label: string;
  emoji: string;
  needsVehicle: boolean;
}

export async function fetchSupportTopics(): Promise<SupportTopic[]> {
  const res = await apiFetch('/api/v1/support/chat/topics');
  if (!res.ok) throw new Error('No se pudo cargar el menú de ayuda');
  const body = (await res.json()) as { topics: SupportTopic[] };
  return body.topics;
}

export const SUPPORT_TOPICS_FALLBACK: SupportTopic[] = [
  { id: 1, label: 'Vehículo', emoji: '🚗', needsVehicle: false },
  { id: 2, label: 'Contrato', emoji: '📄', needsVehicle: false },
  { id: 3, label: 'Pagos y cuotas', emoji: '💳', needsVehicle: false },
  { id: 4, label: 'Seguro', emoji: '🛡️', needsVehicle: false },
  { id: 5, label: 'Emergencia', emoji: '🆘', needsVehicle: false },
];

export type SupportChatAttachmentDto = {
  url: string;
  mimeType: string;
  kind: 'image' | 'video';
};

export type SupportChatMessageDto = {
  id: string;
  role: 'user' | 'bot' | 'agent';
  text: string;
  createdAt: string;
  attachment?: SupportChatAttachmentDto | null;
};

export type SupportChatSessionDto = {
  id: string;
  status: 'ai' | 'human_requested' | 'human_active' | 'closed';
  topic: number | null;
  messages: SupportChatMessageDto[];
  updatedAt: string;
  emergencyReported?: boolean;
};

export async function fetchSupportChatSession(): Promise<SupportChatSessionDto | null> {
  const res = await apiFetch('/api/v1/support/chat/session');
  if (!res.ok) throw new Error('No se pudo cargar la conversación');
  const body = (await res.json()) as { session: SupportChatSessionDto | null };
  return body.session;
}

export async function setSupportChatTopic(payload: {
  topic: number;
  sessionId?: string;
}): Promise<SupportChatSessionDto> {
  const res = await apiFetch('/api/v1/support/chat/set-topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    session?: SupportChatSessionDto;
  };
  if (!res.ok) throw new Error(body.error ?? 'No se pudo cambiar el tema');
  if (!body.session) throw new Error('No se recibió la conversación actualizada');
  return body.session;
}

export async function askSupportChatWithMedia(payload: {
  topic: number;
  question: string;
  sessionId?: string;
  requestHuman?: boolean;
  file: File;
}): Promise<{
  answer: string;
  sources: string[];
  sessionId?: string;
  status?: SupportChatSessionDto['status'];
  handoff?: boolean;
  session?: SupportChatSessionDto;
}> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('topic', String(payload.topic));
  if (payload.question.trim()) form.append('question', payload.question.trim());
  if (payload.sessionId) form.append('sessionId', payload.sessionId);
  if (payload.requestHuman) form.append('requestHuman', '1');

  const res = await apiFetch('/api/v1/support/chat/ask-media', {
    method: 'POST',
    body: form,
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    answer?: string;
    sources?: string[];
    sessionId?: string;
    status?: SupportChatSessionDto['status'];
    handoff?: boolean;
    session?: SupportChatSessionDto;
  };
  if (!res.ok) throw new Error(body.error ?? 'No se pudo enviar el archivo');
  return {
    answer: body.answer!,
    sources: body.sources ?? [],
    sessionId: body.sessionId,
    status: body.status,
    handoff: body.handoff,
    session: body.session,
  };
}

export async function askSupportChat(payload: {
  topic: number;
  question: string;
  sessionId?: string;
  requestHuman?: boolean;
}): Promise<{
  answer: string;
  sources: string[];
  sessionId?: string;
  status?: SupportChatSessionDto['status'];
  handoff?: boolean;
  session?: SupportChatSessionDto;
}> {
  const res = await apiFetch('/api/v1/support/chat/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    answer?: string;
    sources?: string[];
    sessionId?: string;
    status?: SupportChatSessionDto['status'];
    handoff?: boolean;
    session?: SupportChatSessionDto;
  };
  if (!res.ok) throw new Error(body.error ?? 'No se pudo obtener respuesta');
  return {
    answer: body.answer!,
    sources: body.sources ?? [],
    sessionId: body.sessionId,
    status: body.status,
    handoff: body.handoff,
    session: body.session,
  };
}

export async function requestSupportHumanChat(payload: {
  sessionId?: string;
  topic?: number;
  message?: string;
}): Promise<{ answer: string; session: SupportChatSessionDto; handoff: boolean }> {
  const res = await apiFetch('/api/v1/support/chat/request-human', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }
  const body = (await res.json()) as {
    answer?: string;
    session?: SupportChatSessionDto;
    handoff?: boolean;
  };
  if (!body.session) {
    throw new Error('El servidor no devolvió la conversación. Recarga e inténtalo de nuevo.');
  }
  return { answer: body.answer ?? '', session: body.session, handoff: Boolean(body.handoff) };
}

export function isHumanSupportChatStatus(status: SupportChatSessionDto['status'] | undefined): boolean {
  return status === 'human_requested' || status === 'human_active';
}

export async function fetchSupportInventory(): Promise<unknown> {
  const res = await apiFetch('/api/v1/support/chat/inventory');
  if (!res.ok) throw new Error('No se pudo cargar inventario');
  return res.json();
}
