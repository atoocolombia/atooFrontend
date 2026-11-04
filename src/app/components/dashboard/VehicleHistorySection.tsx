import { useEffect, useState } from 'react';
import { History, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSessionUser } from '../../../lib/authRouting';
import {
  fetchVehicleHistoryTimeline,
  VEHICLE_HISTORY_TYPE_LABELS,
  type VehicleHistoryTimelineItem,
} from '../../../lib/vehicleHistoryApi';

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function VehicleHistorySection() {
  const { theme } = useTheme();
  const user = getSessionUser({ refresh: false });
  const [items, setItems] = useState<VehicleHistoryTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    void fetchVehicleHistoryTimeline(user.id)
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const cardClass =
    theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20' : 'bg-white border-gray-200';

  return (
    <section className={`rounded-2xl border p-6 ${cardClass}`}>
      <div className="flex items-center gap-3 mb-4">
        <History className="w-5 h-5 text-[#1A1FE8]" />
        <div>
          <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Historial del vehículo
          </h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Daños, visitas a taller, revisiones periódicas, tecnomecánicas y cambios de piezas.
          </p>
        </div>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-[#1A1FE8]" />
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Aún no hay eventos registrados. Las revisiones en taller aparecerán aquí cuando se completen.
        </p>
      ) : (
        <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-gray-700 bg-white/5' : 'border-gray-100 bg-gray-50'}`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#1A1FE8]">
                  {VEHICLE_HISTORY_TYPE_LABELS[item.eventType]}
                </span>
                <span className="text-xs text-gray-500">{formatWhen(item.occurredAt)}</span>
              </div>
              <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {item.title}
              </p>
              {item.workshopName && (
                <p className="text-xs text-gray-500 mt-0.5">Taller: {item.workshopName}</p>
              )}
              {item.description && (
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
