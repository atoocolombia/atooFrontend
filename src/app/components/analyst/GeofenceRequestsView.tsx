import { useCallback, useEffect, useState } from 'react';
import { Loader2, MapPinOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchAnalystGeofenceRequests,
  reviewGeofenceExitRequest,
  type AnalystGeofenceRequest,
} from '../../../lib/geofenceExitApi';

export function GeofenceRequestsView() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<AnalystGeofenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchAnalystGeofenceRequests('PENDING'));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const review = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const notes = window.prompt(status === 'REJECTED' ? 'Motivo del rechazo (opcional)' : 'Notas (opcional)') ?? undefined;
    setBusyId(id);
    try {
      await reviewGeofenceExitRequest(id, status, notes);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar');
    } finally {
      setBusyId(null);
    }
  };

  const cardClass = theme === 'dark' ? 'bg-[#0D0F2E]/60 border-blue-600/20' : 'bg-white border-gray-200';

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <MapPinOff className="w-8 h-8 text-[#1A1FE8]" /> Salidas de geocerca
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Solicitudes pendientes de clientes</p>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-[#1A1FE8]" />
      ) : rows.length === 0 ? (
        <p className="text-gray-500">No hay solicitudes pendientes.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className={`rounded-xl border p-4 ${cardClass}`}>
              <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{row.clientName}</p>
              <p className="text-sm text-gray-500">{row.email}</p>
              <p className="text-sm mt-2">{row.reason}</p>
              {row.destination && <p className="text-sm text-gray-500">Destino: {row.destination}</p>}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => void review(row.id, 'APPROVED')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => void review(row.id, 'REJECTED')}
                  className="px-3 py-1.5 rounded-lg border border-red-400 text-red-500 text-sm"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
