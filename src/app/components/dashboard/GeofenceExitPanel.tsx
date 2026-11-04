import { useEffect, useState } from 'react';
import { MapPinOff, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchMyGeofenceExitRequests,
  submitGeofenceExitRequest,
  type GeofenceExitRequest,
} from '../../../lib/geofenceExitApi';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En revisión',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  CANCELLED: 'Cancelada',
};

export function GeofenceExitPanel({ compact }: { compact?: boolean }) {
  const { theme } = useTheme();
  const [requests, setRequests] = useState<GeofenceExitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    void fetchMyGeofenceExitRequests()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const hasPending = requests.some((r) => r.status === 'PENDING');

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await submitGeofenceExitRequest({
        reason,
        destination: destination.trim() || undefined,
      });
      setReason('');
      setDestination('');
      setMessage('Solicitud enviada. Te avisaremos por correo cuando sea revisada.');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setSubmitting(false);
    }
  };

  const cardClass =
    theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20' : 'bg-white border-gray-200';
  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/30 text-white'
      : 'bg-white border-gray-200 text-gray-900';

  return (
    <section className={`rounded-2xl border p-6 ${cardClass}`}>
      <div className="flex items-start gap-3 mb-4">
        <MapPinOff className="w-5 h-5 text-[#1A1FE8] shrink-0 mt-0.5" />
        <div>
          <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Salida de geocerca
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Solicita autorización temporal para circular fuera del perímetro acordado.
          </p>
        </div>
      </div>

      {!compact && requests.length > 0 && (
        <div className="mb-4 space-y-2">
          {requests.slice(0, 3).map((r) => (
            <div key={r.id} className={`text-sm rounded-lg p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
              <span className="font-medium">{STATUS_LABEL[r.status] ?? r.status}</span>
              <span className="text-gray-500 ml-2">{r.reason}</span>
              {r.reviewNotes && <p className="text-xs text-gray-500 mt-1">atoo: {r.reviewNotes}</p>}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-[#1A1FE8]" />
      ) : (
        <>
          <textarea
            className={`w-full border rounded-lg px-3 py-2 text-sm mb-2 ${inputClass}`}
            rows={compact ? 2 : 3}
            placeholder="Motivo (obligatorio): viaje, traslado al taller, emergencia…"
            value={reason}
            disabled={hasPending || submitting}
            onChange={(e) => setReason(e.target.value)}
          />
          {!compact && (
            <input
              type="text"
              className={`w-full border rounded-lg px-3 py-2 text-sm mb-3 ${inputClass}`}
              placeholder="Destino o zona (opcional)"
              value={destination}
              disabled={hasPending || submitting}
              onChange={(e) => setDestination(e.target.value)}
            />
          )}
          <button
            type="button"
            disabled={submitting || hasPending || !reason.trim()}
            onClick={() => void submit()}
            className="px-4 py-2 rounded-lg bg-[#1A1FE8] text-white text-sm font-semibold disabled:opacity-50"
          >
            {hasPending ? 'Solicitud en revisión' : submitting ? 'Enviando…' : 'Solicitar salida de geocerca'}
          </button>
          {message && <p className="text-sm text-emerald-600 mt-2">{message}</p>}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </>
      )}
    </section>
  );
}
