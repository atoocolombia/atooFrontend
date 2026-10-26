import { apiFetch, parseErrorResponse } from './http';

export type GpsReportSummary = {
  id: string;
  userId: string;
  originalFileName: string;
  plate: string | null;
  vin: string | null;
  periodFrom: string | null;
  periodTo: string | null;
  totalDistanceKm: number | null;
  tripPointsCount: number | null;
  avgSpeedKmh: number | null;
  maxSpeedKmh: number | null;
  lastLocation: string | null;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastReportAt: string | null;
  highlights: Array<{ label: string; value: string }>;
  samplePoints: Array<{
    at: string | null;
    latitude: number | null;
    longitude: number | null;
    location: string | null;
    speedKmh: number | null;
  }>;
  parseWarnings: string[];
  analystNotes: string | null;
  uploadedAt: string;
  clientDisplayName: string | null;
  vehicleName: string | null;
};

export async function fetchAnalystGpsReports(userId?: string): Promise<GpsReportSummary[]> {
  const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await apiFetch(`/api/v1/analyst/gps-reports${qs}`);
  if (!res.ok) throw new Error(await parseErrorResponse(res));
  const body = (await res.json()) as { reports?: GpsReportSummary[] };
  return body.reports ?? [];
}

export async function uploadAnalystGpsReport(input: {
  userId: string;
  file: File;
  analystNotes?: string;
}): Promise<{ report: GpsReportSummary; warnings: string[] }> {
  const form = new FormData();
  form.append('userId', input.userId);
  form.append('file', input.file);
  if (input.analystNotes?.trim()) form.append('analystNotes', input.analystNotes.trim());

  const res = await apiFetch('/api/v1/analyst/gps-reports', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(await parseErrorResponse(res));
  return (await res.json()) as { report: GpsReportSummary; warnings: string[] };
}
