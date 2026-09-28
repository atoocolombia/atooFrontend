import { ApiError } from './api';
import { apiFetch, apiUrl, fetchWithCreds, parseErrorResponse } from './http';

export type TrainingVideoKind = 'MANDATORY' | 'OPTIONAL';

export interface TrainingVideoDto {
  id: string;
  title: string;
  description: string | null;
  kind: TrainingVideoKind;
  priceCop: number | null;
  sortOrder: number;
  published: boolean;
  mimeType: string;
  sizeBytes: number;
  originalName: string | null;
  createdAt: string;
  updatedAt: string;
  canWatch?: boolean;
  purchaseStatus?: 'NONE' | 'PENDING' | 'APPROVED';
}

export interface TrainingPurchaseAdminDto {
  id: string;
  userId: string;
  userEmail: string;
  trainingVideoId: string;
  videoTitle: string;
  amountCop: number;
  status: 'PENDING' | 'APPROVED';
  approvedAt: string | null;
  createdAt: string;
}

export function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function adminFetchTrainingVideos(): Promise<TrainingVideoDto[]> {
  const res = await apiFetch('/api/v1/admin/training-videos');
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { videos: TrainingVideoDto[] };
  return body.videos;
}

export async function adminFetchTrainingPurchases(): Promise<TrainingPurchaseAdminDto[]> {
  const res = await apiFetch('/api/v1/admin/training-videos/purchases');
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { purchases: TrainingPurchaseAdminDto[] };
  return body.purchases;
}

export async function adminCreateTrainingVideo(input: {
  file: File;
  title: string;
  description?: string;
  kind: TrainingVideoKind;
  priceCop?: number;
  sortOrder?: number;
  published?: boolean;
}): Promise<TrainingVideoDto> {
  const form = new FormData();
  form.append('file', input.file);
  form.append('title', input.title);
  if (input.description) form.append('description', input.description);
  form.append('kind', input.kind);
  if (input.kind === 'OPTIONAL' && input.priceCop != null) {
    form.append('priceCop', String(input.priceCop));
  }
  if (input.sortOrder != null) form.append('sortOrder', String(input.sortOrder));
  form.append('published', String(input.published ?? false));

  const res = await fetchWithCreds(apiUrl('/api/v1/admin/training-videos'), {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { video: TrainingVideoDto };
  return body.video;
}

export async function adminUpdateTrainingVideo(
  videoId: string,
  patch: Partial<{
    title: string;
    description: string | null;
    kind: TrainingVideoKind;
    priceCop: number;
    sortOrder: number;
    published: boolean;
  }>,
): Promise<TrainingVideoDto> {
  const res = await apiFetch(`/api/v1/admin/training-videos/${encodeURIComponent(videoId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { video: TrainingVideoDto };
  return body.video;
}

export async function adminDeleteTrainingVideo(videoId: string): Promise<void> {
  const res = await apiFetch(`/api/v1/admin/training-videos/${encodeURIComponent(videoId)}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new ApiError(await parseErrorResponse(res), res.status);
  }
}

export async function adminApproveTrainingPurchase(purchaseId: string): Promise<void> {
  const res = await apiFetch(
    `/api/v1/admin/training-videos/purchases/${encodeURIComponent(purchaseId)}/approve`,
    { method: 'PATCH' },
  );
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
}

export async function fetchClientTrainingVideos(): Promise<TrainingVideoDto[]> {
  const res = await apiFetch('/api/v1/training-videos');
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const body = (await res.json()) as { videos: TrainingVideoDto[] };
  return body.videos;
}

export async function requestTrainingPurchase(videoId: string): Promise<{ message?: string }> {
  const res = await apiFetch(`/api/v1/training-videos/${encodeURIComponent(videoId)}/request-purchase`, {
    method: 'POST',
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) throw new ApiError(body.error ?? (await parseErrorResponse(res)), res.status);
  return body;
}

export function trainingVideoStreamUrl(videoId: string): string {
  return apiUrl(`/api/v1/training-videos/${encodeURIComponent(videoId)}/stream`);
}

export async function fetchTrainingVideoBlobUrl(videoId: string): Promise<string> {
  const res = await fetchWithCreds(trainingVideoStreamUrl(videoId));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
