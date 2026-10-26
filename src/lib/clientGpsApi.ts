import { apiFetch, parseErrorResponse } from './http';
import type { GpsReportSummary } from './analystGpsApi';

export type ClientGpsUsageSummary = {
  routeKm: number | null;
  maxSpeedKmh: number | null;
  avgSpeedKmh: number | null;
  vehicleOdometerKm: number | null;
  movementDuration: string | null;
  parkedDuration: string | null;
  engineHours: string | null;
};

export type ClientGpsReportView = GpsReportSummary & {
  hasGpsLocation: boolean;
  summaryTitle: string;
  clientHighlights: Array<{ label: string; value: string }>;
  usageSummary?: ClientGpsUsageSummary;
};

export type { GpsReportSummary };

export async function fetchLatestClientGpsReport(): Promise<ClientGpsReportView | null> {
  const res = await apiFetch('/api/v1/client/gps-report/latest');
  if (!res.ok) throw new Error(await parseErrorResponse(res));
  const body = (await res.json()) as { report?: ClientGpsReportView | null };
  return body.report ?? null;
}

export async function fetchClientGpsReportHistory(): Promise<GpsReportSummary[]> {
  const res = await apiFetch('/api/v1/client/gps-report/history');
  if (!res.ok) throw new Error(await parseErrorResponse(res));
  const body = (await res.json()) as { reports?: GpsReportSummary[] };
  return body.reports ?? [];
}

export function formatGpsPeriod(from: string | null, to: string | null): string {
  if (!from && !to) return 'Periodo no indicado en el archivo';
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  if (from && to) return `${fmt(from)} — ${fmt(to)}`;
  return from ? fmt(from) : to ? fmt(to) : '';
}
