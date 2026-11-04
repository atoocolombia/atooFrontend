import { apiFetch } from './http';

export type VehicleHistoryEventType =
  | 'DAMAGE'
  | 'WORKSHOP_VISIT'
  | 'PERIODIC_REVIEW'
  | 'TECHNOMECHANICAL'
  | 'PART_REPLACEMENT'
  | 'OTHER';

export const VEHICLE_HISTORY_TYPE_LABELS: Record<VehicleHistoryEventType, string> = {
  DAMAGE: 'Daño o siniestro',
  WORKSHOP_VISIT: 'Visita a taller',
  PERIODIC_REVIEW: 'Revisión periódica',
  TECHNOMECHANICAL: 'Revisión tecnomecánica',
  PART_REPLACEMENT: 'Cambio de piezas',
  OTHER: 'Otro',
};

export type VehicleHistoryTimelineItem = {
  id: string;
  source: 'record' | 'inspection';
  eventType: VehicleHistoryEventType;
  title: string;
  description: string | null;
  occurredAt: string;
  workshopName?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function fetchVehicleHistoryTimeline(userId: string): Promise<VehicleHistoryTimelineItem[]> {
  const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/vehicle-history`);
  if (!res.ok) throw new Error('No se pudo cargar el historial del vehículo');
  const body = (await res.json()) as { items?: VehicleHistoryTimelineItem[] };
  return body.items ?? [];
}
