import { ApiError } from './api';
import { apiFetch, parseErrorResponse } from './http';
import type { SupportChatMessageDto, SupportChatSessionDto } from './supportChatApi';

export interface SupportChatSessionListItem {
  id: string;
  status: SupportChatSessionDto['status'];
  topic: number | null;
  topicLabel?: string;
  updatedAt: string;
  clientEmail: string;
  clientName: string;
  lastMessage: SupportChatMessageDto | null;
}

export interface SupportChatSessionDetail extends SupportChatSessionDto {
  clientEmail: string;
  clientName: string;
  topicLabel?: string;
}

export async function adminListSupportChats(status = 'open'): Promise<SupportChatSessionListItem[]> {
  const res = await apiFetch(`/api/v1/admin/support-chats?status=${encodeURIComponent(status)}`);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { sessions: SupportChatSessionListItem[] };
  return body.sessions;
}

export async function adminFetchSupportChat(sessionId: string): Promise<SupportChatSessionDetail> {
  const res = await apiFetch(`/api/v1/admin/support-chats/${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { session: SupportChatSessionDetail };
  return body.session;
}

export async function adminReplySupportChat(sessionId: string, text: string): Promise<SupportChatSessionDetail> {
  const res = await apiFetch(`/api/v1/admin/support-chats/${encodeURIComponent(sessionId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { session: SupportChatSessionDetail };
  return body.session;
}

export async function adminCloseSupportChat(sessionId: string): Promise<SupportChatSessionDetail> {
  const res = await apiFetch(`/api/v1/admin/support-chats/${encodeURIComponent(sessionId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'CLOSED' }),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { session: SupportChatSessionDetail };
  return body.session;
}
