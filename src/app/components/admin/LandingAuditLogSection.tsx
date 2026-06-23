import { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { adminFetchLandingAuditLogs, type LandingAuditLogEntry } from '../../../lib/landingApi';
import { ApiError } from '../../../lib/api';

type Props = {
  theme: 'light' | 'dark';
  cardClass: string;
  refreshKey?: number;
};

function formatWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function LandingAuditLogSection({ theme, cardClass, refreshKey = 0 }: Props) {
  const [logs, setLogs] = useState<LandingAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminFetchLandingAuditLogs(40);
      setLogs(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <section className={`rounded-2xl border p-6 ${cardClass}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Historial de cambios</h2>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Registro de quién modificó la landing y qué cambió.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
            theme === 'dark'
              ? 'border-white/10 hover:bg-white/5 text-gray-300'
              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Actualizar
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400 mb-3">{error}</p>
      )}

      {loading && logs.length === 0 ? (
        <div className="flex justify-center py-8 text-[#1A1FE8]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Aún no hay cambios registrados.
        </p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {logs.map((log) => (
            <li
              key={log.id}
              className={`rounded-xl border px-4 py-3 text-sm ${
                theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{log.summary}</p>
                <time className={`text-xs shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {formatWhen(log.createdAt)}
                </time>
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-blue-300/80' : 'text-[#1A1FE8]'}`}>
                {log.actorEmail}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
