import { useEffect, useState } from 'react';
import { Calendar, Loader2, LogOut } from 'lucide-react';
import { clearUserSession, getSessionUser } from '../../lib/authRouting';
import {
  bookPracticalTestSlot,
  fetchAvailablePracticalSlots,
  fetchPracticalTestClientState,
  type AvailableSlot,
} from '../../lib/practicalTestApi';

export function PracticalTestBookingPage() {
  const user = getSessionUser();
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [appointment, setAppointment] = useState<{ date: string; startTime: string; endTime: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const from = new Date().toISOString().slice(0, 10);
    void (async () => {
      try {
        const state = await fetchPracticalTestClientState(user.id);
        if (state.appointment) {
          setAppointment(state.appointment);
        } else if (state.schedulingEnabled) {
          setSlots(await fetchAvailablePracticalSlots(user.id, from));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleBook = async (slot: AvailableSlot) => {
    if (!user) return;
    const key = `${slot.date}|${slot.startTime}`;
    setBooking(key);
    setError(null);
    try {
      await bookPracticalTestSlot(user.id, slot);
      setAppointment(slot);
      setSlots([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agendar');
    } finally {
      setBooking(null);
    }
  };

  const logout = async () => {
    await clearUserSession();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-[#1A1FE8] text-xl">atoo — Prueba práctica</span>
        <button type="button" onClick={() => void logout()} className="text-sm text-gray-600 inline-flex gap-1 items-center">
          <LogOut className="w-4 h-4" /> Salir
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
          </div>
        ) : appointment ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <Calendar className="w-12 h-12 text-[#1A1FE8] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cita confirmada</h1>
            <p className="text-gray-600">
              {appointment.date} de {appointment.startTime} a {appointment.endTime}
            </p>
            <p className="text-sm text-gray-500 mt-4">Te esperamos para la prueba práctica con vehículo eléctrico.</p>
          </div>
        ) : slots.length === 0 ? (
          <p className="text-center text-gray-600">
            {error ?? 'No hay horarios disponibles por ahora. El analista publicará franjas pronto; vuelve a intentar más tarde.'}
          </p>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Agenda tu prueba práctica</h1>
            <p className="text-gray-600 mb-6">Elige un horario disponible con nuestro analista.</p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="space-y-2">
              {slots.map((slot) => {
                const key = `${slot.date}|${slot.startTime}`;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={booking === key}
                    onClick={() => void handleBook(slot)}
                    className="w-full text-left px-4 py-3 rounded-xl border bg-white hover:border-[#1A1FE8] disabled:opacity-50"
                  >
                    <span className="font-medium">{slot.date}</span>
                    <span className="text-gray-600 ml-2">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
