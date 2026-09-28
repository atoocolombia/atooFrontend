import { apiFetch } from './http';

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

export interface SupportChatContext {
  vehicle: 'nammi' | 'aeolus' | null;
  vehicleLabel: string | null;
  source: 'plan' | 'delivery' | null;
}

export async function fetchSupportChatContext(): Promise<SupportChatContext> {
  const res = await apiFetch('/api/v1/support/chat/context');
  if (!res.ok) throw new Error('No se pudo cargar tu vehículo');
  return res.json() as Promise<SupportChatContext>;
}

export async function askSupportChat(payload: {
  topic: number;
  question: string;
}): Promise<{ answer: string; sources: string[] }> {
  const res = await apiFetch('/api/v1/support/chat/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string; answer?: string; sources?: string[] };
  if (!res.ok) throw new Error(body.error ?? 'No se pudo obtener respuesta');
  return { answer: body.answer!, sources: body.sources ?? [] };
}

export async function fetchSupportInventory(): Promise<unknown> {
  const res = await apiFetch('/api/v1/support/chat/inventory');
  if (!res.ok) throw new Error('No se pudo cargar inventario');
  return res.json();
}
