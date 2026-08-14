import { apiFetch, isApiConfigured, parseErrorResponse } from './http';
import { ApiError } from './api';

export async function fetchPushConfig(): Promise<{ configured: boolean; publicKey: string | null }> {
  if (!isApiConfigured()) return { configured: false, publicKey: null };
  const res = await apiFetch('/api/v1/push/config');
  if (!res.ok) return { configured: false, publicKey: null };
  return (await res.json()) as { configured: boolean; publicKey: string | null };
}

export async function savePushSubscription(subscription: {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}): Promise<void> {
  const res = await apiFetch('/api/v1/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
}

export async function sendPushTest(): Promise<void> {
  const res = await apiFetch('/api/v1/push/test', { method: 'POST' });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
}
