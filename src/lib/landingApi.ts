import { ApiError } from './api';
import { fetchWithCreds, apiUrl, parseErrorResponse, isApiConfigured, getApiBase } from './http';
import type { CatalogVehicle, VehicleSpec } from '../app/data/vehicles';
import type { LandingContent } from '../app/data/landingContent';



export interface LandingAuditLogEntry {
  id: string;
  actorEmail: string;
  action: string;
  summary: string;
  metadata: unknown;
  createdAt: string;
}

export interface LandingSettings {
  maxVisibleVehicles: number;
}

export interface AdminCatalogVehicle extends CatalogVehicle {
  active: boolean;
  sortOrder: number;
  specSheetPdf: string | null;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
    originalName: string;
    storedPath: string | null;
    publicUrl: string | null;
  }>;
}

function mapVehicleDto(raw: AdminCatalogVehicle): AdminCatalogVehicle {
  return {
    ...raw,
    gallery: raw.gallery?.length ? raw.gallery : raw.image ? [raw.image] : [],
  };
}

export async function fetchLandingVehicles(): Promise<CatalogVehicle[]> {
  if (!isApiConfigured()) return [];
  const res = await fetchWithCreds(apiUrl('/api/v1/landing/vehicles'));
  if (!res.ok) return [];
  const data = (await res.json()) as AdminCatalogVehicle[];
  return data.map(mapVehicleDto);
}

export async function fetchLandingSettings(): Promise<LandingSettings | null> {
  if (!isApiConfigured()) return null;
  const res = await fetchWithCreds(apiUrl('/api/v1/landing/settings'));
  if (!res.ok) return null;
  return (await res.json()) as LandingSettings;
}

function resolveMediaUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/api/')) {
    const base = getApiBase();
    if (base) return `${base}${url}`;
  }
  return url;
}

function mapLandingContentDto(raw: LandingContent): LandingContent {
  const video = raw.hero.video ?? raw.hero.videoUrl;
  const poster = raw.hero.poster ?? raw.hero.posterUrl;
  return {
    ...raw,
    hero: {
      ...raw.hero,
      video: resolveMediaUrl(video),
      poster: resolveMediaUrl(poster),
    },
  };
}

export async function fetchLandingContent(): Promise<LandingContent | null> {
  if (!isApiConfigured()) return null;
  const res = await fetchWithCreds(apiUrl('/api/v1/landing/content'));
  if (!res.ok) return null;
  return mapLandingContentDto((await res.json()) as LandingContent);
}

export async function adminFetchLandingSettings(): Promise<LandingSettings> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/settings'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as LandingSettings;
}

export async function adminUpdateLandingSettings(maxVisibleVehicles: number): Promise<LandingSettings> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/settings'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ maxVisibleVehicles }),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as LandingSettings;
}

export async function adminFetchLandingContent(): Promise<LandingContent> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/content'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapLandingContentDto((await res.json()) as LandingContent);
}

export async function adminUpdateLandingContent(content: LandingContent): Promise<LandingContent> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/content'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapLandingContentDto((await res.json()) as LandingContent);
}

export async function adminUploadHeroVideo(file: File): Promise<LandingContent> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/hero/video'), {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapLandingContentDto((await res.json()) as LandingContent);
}

export async function adminClearHeroVideo(): Promise<LandingContent> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/hero/video'), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapLandingContentDto((await res.json()) as LandingContent);
}

export async function adminUploadHeroPoster(file: File): Promise<LandingContent> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/hero/poster'), {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapLandingContentDto((await res.json()) as LandingContent);
}

export async function adminClearHeroPoster(): Promise<LandingContent> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/hero/poster'), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapLandingContentDto((await res.json()) as LandingContent);
}

export async function adminFetchCatalogVehicles(): Promise<AdminCatalogVehicle[]> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/vehicles'));
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  const data = (await res.json()) as AdminCatalogVehicle[];
  return data.map(mapVehicleDto);
}

export async function adminCreateCatalogVehicle(payload: {
  slug: string;
  name: string;
  subtitle?: string;
  type?: 'carro' | 'camioneta' | 'CARRO' | 'CAMIONETA';
  highlights?: string[];
  features?: string[];
  specs?: VehicleSpec[];
  badge?: string | null;
  popular?: boolean;
  weeklyPriceCop?: number;
  active?: boolean;
  sortOrder?: number;
  specSheetPath?: string | null;
}): Promise<AdminCatalogVehicle> {
  const res = await fetchWithCreds(apiUrl('/api/v1/admin/landing/vehicles'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapVehicleDto((await res.json()) as AdminCatalogVehicle);
}

export async function adminDeleteCatalogVehicle(id: string): Promise<void> {
  const res = await fetchWithCreds(apiUrl(`/api/v1/admin/landing/vehicles/${id}`), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
}

export async function adminUpdateCatalogVehicle(
  id: string,
  payload: Partial<{
    slug: string;
    name: string;
    subtitle: string;
    type: 'carro' | 'camioneta' | 'CARRO' | 'CAMIONETA';
    highlights: string[];
    features: string[];
    specs: VehicleSpec[];
    badge: string | null;
    popular: boolean;
    weeklyPriceCop: number;
    active: boolean;
    sortOrder: number;
    specSheetPath: string | null;
  }>,
): Promise<AdminCatalogVehicle> {
  const res = await fetchWithCreds(apiUrl(`/api/v1/admin/landing/vehicles/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapVehicleDto((await res.json()) as AdminCatalogVehicle);
}

export async function adminUploadVehicleImage(
  vehicleId: string,
  file: File,
  isPrimary = false,
): Promise<AdminCatalogVehicle> {
  const form = new FormData();
  form.append('file', file);
  form.append('isPrimary', String(isPrimary));
  const res = await fetchWithCreds(apiUrl(`/api/v1/admin/landing/vehicles/${vehicleId}/images`), {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapVehicleDto((await res.json()) as AdminCatalogVehicle);
}

export async function adminDeleteVehicleImage(
  vehicleId: string,
  imageId: string,
): Promise<AdminCatalogVehicle> {
  const res = await fetchWithCreds(apiUrl(`/api/v1/admin/landing/vehicles/${vehicleId}/images/${imageId}`), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapVehicleDto((await res.json()) as AdminCatalogVehicle);
}

export async function adminSetPrimaryVehicleImage(
  vehicleId: string,
  imageId: string,
): Promise<AdminCatalogVehicle> {
  const res = await fetchWithCreds(apiUrl(`/api/v1/admin/landing/vehicles/${vehicleId}/images/${imageId}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPrimary: true }),
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return mapVehicleDto((await res.json()) as AdminCatalogVehicle);
}

export async function adminFetchLandingAuditLogs(limit = 50): Promise<LandingAuditLogEntry[]> {
  const res = await fetchWithCreds(apiUrl(`/api/v1/admin/landing/audit-logs?limit=${limit}`), {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new ApiError(await parseErrorResponse(res), res.status);
  return (await res.json()) as LandingAuditLogEntry[];
}

export function isLandingApiConfigured(): boolean {
  return isApiConfigured();
}
