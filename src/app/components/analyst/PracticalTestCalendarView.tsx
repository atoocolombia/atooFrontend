import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchAnalystPracticalAppointments,
  fetchAnalystWeeklySchedule,
  fetchPracticalEvaluationForm,
  saveAnalystWeeklySchedule,
  submitPracticalEvaluation,
  type PracticalTestAppointmentCard,
  type WeeklyScheduleItem,
} from '../../../lib/practicalTestApi';

const WEEKDAYS = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function PracticalTestCalendarView() {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [anchorDate, setAnchorDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>([]);
  const [appointments, setAppointments] = useState<PracticalTestAppointmentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evalTarget, setEvalTarget] = useState<PracticalTestAppointmentCard | null>(null);
  const [evalQuestions, setEvalQuestions] = useState<{ id: string; text: string; options: string[] }[]>([]);
  const [evalAnswers, setEvalAnswers] = useState<Record<string, string>>({});
  const [evalNotes, setEvalNotes] = useState('');
  const [evalSubmitting, setEvalSubmitting] = useState(false);

  const range = useMemo(() => {
    if (viewMode === 'day') return { from: anchorDate, to: anchorDate };
    return { from: anchorDate, to: addDays(anchorDate, 6) };
  }, [anchorDate, viewMode]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sched, appts] = await Promise.all([
        fetchAnalystWeeklySchedule(),
        fetchAnalystPracticalAppointments(range.from, range.to),
      ]);
      setSchedule(sched);
      setAppointments(appts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateScheduleRow = (weekday: number, patch: Partial<WeeklyScheduleItem>) => {
    setSchedule((prev) => {
      const existing = prev.find((s) => s.weekday === weekday);
      if (existing) {
        return prev.map((s) => (s.weekday === weekday ? { ...s, ...patch } : s));
      }
      return [...prev, { weekday, startTime: '09:00', endTime: '17:00', slotMinutes: 60, ...patch }];
    });
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    setError(null);
    try {
      const items = schedule.filter((s) => s.startTime && s.endTime);
      setSchedule(await saveAnalystWeeklySchedule(items));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar horario');
    } finally {
      setSavingSchedule(false);
    }
  };

  const openEvaluation = async (appt: PracticalTestAppointmentCard) => {
    setEvalTarget(appt);
    setEvalAnswers({});
    setEvalNotes('');
    const form = await fetchPracticalEvaluationForm();
    setEvalQuestions(form.questions);
  };

  const submitEvaluation = async () => {
    if (!evalTarget) return;
    setEvalSubmitting(true);
    try {
      await submitPracticalEvaluation(evalTarget.id, evalAnswers, evalNotes);
      setEvalTarget(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar evaluación');
    } finally {
      setEvalSubmitting(false);
    }
  };

  const cardClass = theme === 'dark' ? 'bg-[#0D0F2E]/60 border-blue-600/20' : 'bg-white border-gray-200';

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-3xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Calendar className="w-8 h-8 text-[#1A1FE8]" /> Prueba práctica EV
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Configura tu horario semanal y gestiona las citas agendadas por los clientes
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <section className={`rounded-2xl border p-5 ${cardClass}`}>
        <h2 className={`font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Horario semanal de atención</h2>
        <div className="space-y-3">
          {WEEKDAYS.map((day) => {
            const row = schedule.find((s) => s.weekday === day.id) ?? {
              weekday: day.id,
              startTime: '',
              endTime: '',
              slotMinutes: 60,
            };
            const enabled = Boolean(row.startTime && row.endTime);
            return (
              <div key={day.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-sm">
                <span className="font-medium">{day.label}</span>
                <input
                  type="time"
                  value={row.startTime}
                  onChange={(e) => updateScheduleRow(day.id, { startTime: e.target.value })}
                  className="border rounded px-2 py-1"
                />
                <input
                  type="time"
                  value={row.endTime}
                  onChange={(e) => updateScheduleRow(day.id, { endTime: e.target.value })}
                  className="border rounded px-2 py-1"
                />
                <select
                  value={row.slotMinutes}
                  onChange={(e) => updateScheduleRow(day.id, { slotMinutes: Number(e.target.value) })}
                  className="border rounded px-2 py-1"
                  disabled={!enabled}
                >
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    enabled
                      ? updateScheduleRow(day.id, { startTime: '', endTime: '' })
                      : updateScheduleRow(day.id, { startTime: '09:00', endTime: '17:00' })
                  }
                  className="text-xs text-[#1A1FE8]"
                >
                  {enabled ? 'Desactivar día' : 'Activar día'}
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          disabled={savingSchedule}
          onClick={() => void saveSchedule()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1FE8] text-white text-sm font-semibold disabled:opacity-50"
        >
          {savingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar horario
        </button>
      </section>

      <section className={`rounded-2xl border p-5 ${cardClass}`}>
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <h2 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Calendario de citas</h2>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'day' ? 'bg-[#1A1FE8] text-white' : 'border'}`}
            >
              Día
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'week' ? 'bg-[#1A1FE8] text-white' : 'border'}`}
            >
              Semana
            </button>
          </div>
        </div>

        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin text-[#1A1FE8]" />
        ) : appointments.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay citas en este rango.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt.id} className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{appt.clientName}</p>
                <p className="text-sm text-gray-500">
                  {appt.date} · {appt.startTime} – {appt.endTime}
                </p>
                <p className="text-sm text-gray-500">{appt.clientEmail}</p>
                {appt.hasEvaluation && appt.evaluation ? (
                  <p className="text-sm text-emerald-600 mt-2">
                    Evaluación registrada — Ponderado {appt.evaluation.overallScore}%
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void openEvaluation(appt)}
                    className="mt-2 text-sm font-semibold text-[#1A1FE8]"
                  >
                    Llenar evaluación de prueba práctica
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {evalTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className={`max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl p-6 ${cardClass}`}>
            <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Evaluación — {evalTarget.clientName}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {evalTarget.date} {evalTarget.startTime}
            </p>
            <div className="space-y-4">
              {evalQuestions.map((q) => (
                <fieldset key={q.id}>
                  <legend className="text-sm font-medium mb-2">{q.text}</legend>
                  <div className="space-y-1">
                    {q.options.map((opt) => (
                      <label key={opt} className="flex gap-2 text-sm">
                        <input
                          type="radio"
                          name={q.id}
                          checked={evalAnswers[q.id] === opt}
                          onChange={() => setEvalAnswers((a) => ({ ...a, [q.id]: opt }))}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <textarea
                placeholder="Notas del analista (opcional)"
                className="w-full border rounded p-2 text-sm"
                rows={3}
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <button type="button" onClick={() => setEvalTarget(null)} className="px-4 py-2 text-sm border rounded-lg">
                Cancelar
              </button>
              <button
                type="button"
                disabled={evalSubmitting || evalQuestions.some((q) => !evalAnswers[q.id])}
                onClick={() => void submitEvaluation()}
                className="px-4 py-2 text-sm rounded-lg bg-[#1A1FE8] text-white disabled:opacity-50"
              >
                {evalSubmitting ? 'Guardando…' : 'Guardar evaluación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
