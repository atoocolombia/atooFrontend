import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  approveApplication,
  fetchPendingApplications,
  rejectApplication,
  type PendingApplication,
} from '../../../lib/deliveriesApi';

export function PendingApplicationsLiveView() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchPendingApplications());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cardClass =
    theme === 'dark' ? 'bg-[#0D0F2E]/60 border-blue-600/20' : 'bg-white border-gray-200';

  const approve = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      await approveApplication(id);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo aprobar');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt('Motivo del rechazo (opcional)') ?? undefined;
    setBusyId(id);
    setError(null);
    try {
      await rejectApplication(id, reason);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo rechazar');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Solicitudes pendientes
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Al aprobar, se crea la card de entrega para el asesor
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">No hay solicitudes pendientes.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {rows.map((app) => (
            <div key={app.id} className={`rounded-2xl border p-5 ${cardClass}`}>
              <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {app.clientName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">CC {app.idDocumentNumber ?? '—'}</p>
              <p className="text-sm text-gray-500">{app.email}</p>
              <p className="text-sm text-gray-500">{app.phone ?? 'Sin celular'}</p>
              <p className="text-sm text-gray-500">{app.address ?? 'Sin dirección'}</p>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  disabled={busyId === app.id}
                  onClick={() => void approve(app.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Aprobar
                </button>
                <button
                  type="button"
                  disabled={busyId === app.id}
                  onClick={() => void reject(app.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-400 text-red-500 text-sm font-semibold disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
