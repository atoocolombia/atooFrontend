import { useEffect, useState } from 'react';
import { CalendarPlus, Loader2, Trash2, Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSessionUser } from '../../../lib/authRouting';
import {
  createWorkshopAvailabilitySlot,
  deleteWorkshopAvailabilitySlot,
  fetchWorkshopAvailability,
  updateWorkshopAvailabilitySlot,
  type WorkshopAvailabilitySlot,
} from '../../../lib/workshopPortalApi';

export function WorkshopAvailabilityView() {
  const { theme } = useTheme();
  const userId = getSessionUser()?.id ?? '';
  const [slots, setSlots] = useState<WorkshopAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [maxAppointments, setMaxAppointments] = useState(4);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setSlots(await fetchWorkshopAvailability(userId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !date) return;
    setSaving(true);
    setError(null);
    try {
      await createWorkshopAvailabilitySlot(userId, {
        date,
        startTime,
        endTime,
        maxAppointments,
      });
      setDate('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la franja');
    } finally {
      setSaving(false);
    }
  };

  const handleCapacityChange = async (slot: WorkshopAvailabilitySlot, value: number) => {
    if (!userId) return;
    try {
      await updateWorkshopAvailabilitySlot(userId, slot.id, { maxAppointments: value });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar');
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!userId) return;
    try {
      await deleteWorkshopAvailabilitySlot(userId, slotId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
    }
  };

  const cardClass = `rounded-2xl border p-6 ${
    theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20' : 'bg-white border-gray-200'
  }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Disponibilidad
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Publica fechas, horarios y cupos que verán los clientes al solicitar cita
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <form onSubmit={handleCreate} className={cardClass}>
        <h2 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <CalendarPlus className="w-5 h-5 text-[#1A1FE8]" />
          Nueva franja
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`rounded-xl border px-4 py-3 ${
              theme === 'dark' ? 'bg-white/5 border-blue-600/30 text-white' : 'border-gray-200'
            }`}
          />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={`rounded-xl border px-4 py-3 ${
              theme === 'dark' ? 'bg-white/5 border-blue-600/30 text-white' : 'border-gray-200'
            }`}
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`rounded-xl border px-4 py-3 ${
              theme === 'dark' ? 'bg-white/5 border-blue-600/30 text-white' : 'border-gray-200'
            }`}
          />
          <input
            type="number"
            min={1}
            max={50}
            value={maxAppointments}
            onChange={(e) => setMaxAppointments(Number(e.target.value))}
            className={`rounded-xl border px-4 py-3 ${
              theme === 'dark' ? 'bg-white/5 border-blue-600/30 text-white' : 'border-gray-200'
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 px-6 py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold hover:bg-[#1217C8] disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Publicar franja
        </button>
      </form>

      <div className={cardClass}>
        <h2 className={`font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Franjas publicadas
        </h2>
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
        ) : slots.length === 0 ? (
          <p className="text-gray-500 text-sm">Aún no has publicado disponibilidad.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                  <th className="text-left py-2">Fecha</th>
                  <th className="text-left py-2">Horario</th>
                  <th className="text-left py-2">Cupos</th>
                  <th className="text-left py-2">Reservados</th>
                  <th className="text-right py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id} className={`border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'}`}>
                    <td className={`py-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{slot.date}</td>
                    <td className="text-gray-500">{slot.startTime} – {slot.endTime}</td>
                    <td>
                      <input
                        type="number"
                        min={slot.bookedCount}
                        max={50}
                        defaultValue={slot.maxAppointments}
                        onBlur={(e) =>
                          handleCapacityChange(slot, Number(e.target.value))
                        }
                        className={`w-20 rounded-lg border px-2 py-1 ${
                          theme === 'dark' ? 'bg-white/5 border-blue-600/30' : 'border-gray-200'
                        }`}
                      />
                    </td>
                    <td className="text-gray-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {slot.bookedCount} / {slot.maxAppointments}
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(slot.id)}
                        disabled={slot.bookedCount > 0}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 disabled:opacity-30"
                        title={slot.bookedCount > 0 ? 'Hay citas reservadas' : 'Eliminar'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
