export function formatGeofenceDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-CO', {
      timeZone: 'America/Bogota',
      dateStyle: 'medium',
    });
  } catch {
    return iso;
  }
}
