import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  PlayCircle,
  X,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSessionUser } from '../../../lib/authRouting';
import {
  fetchWorkshopAppointments,
  fetchWorkshopAvailability,
  rescheduleWorkshopAppointment,
  updateWorkshopAppointmentStatus,
  workshopProofUrl,
  type WorkshopInspectionAppointment,
} from '../../../lib/workshopPortalApi';
import type { WorkshopAvailabilitySlot } from '../../../lib/inspectionsApi';
import { WorkshopInspectionSessionPanel } from './WorkshopInspectionSessionPanel';

const STATUS_LABELS: Record<WorkshopInspectionAppointment['status'], string> = {
  PENDING: 'Por confirmar',
  CONFIRMED: 'Confirmada',
  IN_PROGRESS: 'En revisión',
  REJECTED: 'Rechazada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  RESCHEDULE_PENDING: 'Reagendamiento',
};

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function calendarDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function displayDateForAppointment(apt: WorkshopInspectionAppointment): string {
  if (apt.status === 'RESCHEDULE_PENDING' && apt.proposedAppointmentDate) {
    return apt.proposedAppointmentDate;
  }
  return apt.appointmentDate;
}

function displayTimeForAppointment(apt: WorkshopInspectionAppointment): string | null {
  if (apt.status === 'RESCHEDULE_PENDING' && apt.proposedAppointmentTime) {
    return apt.proposedAppointmentTime;
  }
  return apt.appointmentTime;
}

function appointmentColorClass(apt: WorkshopInspectionAppointment): string {
  if (apt.status === 'CONFIRMED') return 'bg-emerald-500/90 text-white';
  if (apt.status === 'IN_PROGRESS') return 'bg-sky-500 text-white';
  if (apt.status === 'COMPLETED') return 'bg-slate-500 text-white';
  if (apt.status === 'PENDING') return 'bg-amber-400 text-amber-950';
  if (apt.status === 'RESCHEDULE_PENDING') {
    return apt.rescheduleInitiatedBy === 'CLIENT'
      ? 'bg-orange-500 text-white'
      : 'bg-violet-500 text-white';
  }
  return 'bg-gray-400 text-white';
}

function appointmentLegendLabel(apt: WorkshopInspectionAppointment): string {
  if (apt.status === 'CONFIRMED') return 'Confirmada';
  if (apt.status === 'IN_PROGRESS') return 'En revisión';
  if (apt.status === 'COMPLETED') return 'Completada';
  if (apt.status === 'PENDING') return 'Por confirmar';
  if (apt.status === 'RESCHEDULE_PENDING') {
    return apt.rescheduleInitiatedBy === 'CLIENT'
      ? 'Cliente propuso otra fecha'
      : 'Esperando respuesta del cliente';
  }
  return STATUS_LABELS[apt.status];
}

interface WorkshopAppointmentsViewProps {
  onUpdated?: () => void;
}

export function WorkshopAppointmentsView({ onUpdated }: WorkshopAppointmentsViewProps) {
  const { theme } = useTheme();
  const userId = getSessionUser()?.id ?? '';
  const [appointments, setAppointments] = useState<WorkshopInspectionAppointment[]>([]);
  const [slots, setSlots] = useState<WorkshopAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selected, setSelected] = useState<WorkshopInspectionAppointment | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [sessionApt, setSessionApt] = useState<WorkshopInspectionAppointment | null>(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [apts, availability] = await Promise.all([
        fetchWorkshopAppointments(userId),
        fetchWorkshopAvailability(userId),
      ]);
      setAppointments(apts);
      setSlots(availability.filter((s) => s.remainingCapacity > 0));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, WorkshopInspectionAppointment[]>();
    for (const apt of appointments) {
      const key = displayDateForAppointment(apt);
      const list = map.get(key) ?? [];
      list.push(apt);
      map.set(key, list);
    }
    return map;
  }, [appointments]);

  const calendarCells = useMemo(() => {
    const { year, month } = viewMonth;
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number | null; dateKey: string | null }> = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ day: null, dateKey: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, dateKey: calendarDateKey(year, month, day) });
    }
    return cells;
  }, [viewMonth]);

  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length;
  const clientCounterCount = appointments.filter(
    (a) => a.status === 'RESCHEDULE_PENDING' && a.rescheduleInitiatedBy === 'CLIENT',
  ).length;

  const handleStatus = async (
    id: string,
    status: WorkshopInspectionAppointment['status'],
  ) => {
    if (!userId) return;
    setActingId(id);
    try {
      await updateWorkshopAppointmentStatus(userId, id, status);
      await load();
      onUpdated?.();
      setSelected(null);
    } finally {
      setActingId(null);
    }
  };

  const handleReschedule = async () => {
    if (!userId || !selected) return;
    const slot = slots.find((s) => s.id === rescheduleSlotId);
    if (!slot) {
      setRescheduleError('Elige un horario disponible');
      return;
    }

    setActingId(selected.id);
    setRescheduleError(null);
    try {
      await rescheduleWorkshopAppointment(userId, selected.id, {
        appointmentDate: slot.date,
        appointmentTime: slot.startTime,
        note: rescheduleNote.trim() || undefined,
      });
      setRescheduleOpen(false);
      setRescheduleNote('');
      setSelected(null);
      await load();
      onUpdated?.();
    } catch (e) {
      setRescheduleError(e instanceof Error ? e.message : 'No se pudo reagendar');
    } finally {
      setActingId(null);
    }
  };

  const openReschedule = (apt: WorkshopInspectionAppointment) => {
    setSelected(apt);
    setRescheduleOpen(true);
    setRescheduleSlotId(slots[0]?.id ?? '');
    setRescheduleNote('');
    setRescheduleError(null);
  };

  const cardClass =
    theme === 'dark'
      ? 'bg-[#0D0F2E]/50 border-blue-600/20'
      : 'bg-white border-gray-200';

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Calendario de citas
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Visualiza confirmadas, pendientes y reagendamientos en un solo lugar
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          Confirmadas
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/15 text-sky-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-sky-500" />
          En revisión
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-800 font-medium">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          Por confirmar ({pendingCount})
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-violet-500" />
          Reagendadas (esperando cliente)
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-700 font-medium">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          Cliente propuso otra fecha ({clientCounterCount})
        </span>
      </div>

      <div className={`rounded-2xl border p-5 ${cardClass}`}>
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={() =>
              setViewMonth((m) =>
                m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 },
              )
            }
            className="p-2 rounded-lg hover:bg-black/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {MONTHS[viewMonth.month]} {viewMonth.year}
          </h2>
          <button
            type="button"
            onClick={() =>
              setViewMonth((m) =>
                m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 },
              )
            }
            className="p-2 rounded-lg hover:bg-black/5"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            if (!cell.day || !cell.dateKey) {
              return <div key={`empty-${idx}`} className="min-h-[88px]" />;
            }

            const dayAppointments = appointmentsByDate.get(cell.dateKey) ?? [];
            const isToday = cell.dateKey === new Date().toISOString().slice(0, 10);

            return (
              <div
                key={cell.dateKey}
                className={`min-h-[88px] rounded-xl border p-1.5 ${
                  isToday
                    ? 'border-[#1A1FE8]/50 bg-[#1A1FE8]/5'
                    : theme === 'dark'
                      ? 'border-blue-600/10 bg-white/[0.02]'
                      : 'border-gray-100 bg-gray-50/50'
                }`}
              >
                <p
                  className={`text-xs font-semibold mb-1 ${
                    isToday ? 'text-[#1A1FE8]' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {cell.day}
                </p>
                <div className="space-y-0.5">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={() => setSelected(apt)}
                      className={`w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate ${appointmentColorClass(apt)}`}
                      title={`${apt.clientDisplayName ?? apt.clientEmail} · ${displayTimeForAppointment(apt) ?? ''}`}
                    >
                      {displayTimeForAppointment(apt) ?? '—'}{' '}
                      {(apt.clientDisplayName ?? apt.clientEmail ?? 'Cliente').split(' ')[0]}
                    </button>
                  ))}
                  {dayAppointments.length > 3 && (
                    <p className="text-[10px] text-gray-500 px-1">+{dayAppointments.length - 3} más</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {appointments.length === 0 && (
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
          No hay citas registradas todavía.
        </p>
      )}

      {selected && !rescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className={`w-full max-w-lg rounded-2xl border p-6 shadow-xl ${cardClass}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${appointmentColorClass(selected)}`}
                >
                  {appointmentLegendLabel(selected)}
                </span>
                <p className={`font-bold text-lg mt-2 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <User className="w-4 h-4 text-[#1A1FE8]" />
                  {selected.clientDisplayName ?? selected.clientEmail ?? 'Cliente'}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-black/5">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p className={`flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="w-4 h-4" />
                {displayDateForAppointment(selected)} · {displayTimeForAppointment(selected) ?? '—'}
              </p>
              {selected.status === 'RESCHEDULE_PENDING' && selected.proposedAppointmentDate && (
                <p className="text-violet-600 text-xs">
                  Fecha original: {selected.appointmentDate} {selected.appointmentTime ?? ''}
                </p>
              )}
              {selected.reason && (
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  <strong>Motivo:</strong> {selected.reason}
                </p>
              )}
              {selected.proofOriginalName && userId && (
                <a
                  href={workshopProofUrl(userId, selected.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-[#1A1FE8] hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  Ver prueba: {selected.proofOriginalName}
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {selected.status === 'PENDING' && (
                <>
                  <button
                    type="button"
                    disabled={actingId === selected.id}
                    onClick={() => handleStatus(selected.id, 'CONFIRMED')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {actingId === selected.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Confirmar
                  </button>
                  <button
                    type="button"
                    disabled={actingId === selected.id}
                    onClick={() => handleStatus(selected.id, 'REJECTED')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 text-red-600 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </>
              )}

              {selected.status === 'RESCHEDULE_PENDING' &&
                selected.rescheduleInitiatedBy === 'CLIENT' && (
                  <>
                    <button
                      type="button"
                      disabled={actingId === selected.id}
                      onClick={() => handleStatus(selected.id, 'CONFIRMED')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {actingId === selected.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Aceptar nueva fecha
                    </button>
                    <button
                      type="button"
                      onClick={() => openReschedule(selected)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1A1FE8]/40 text-[#1A1FE8] text-sm font-semibold hover:bg-[#1A1FE8]/5"
                    >
                      <CalendarClock className="w-4 h-4" />
                      Proponer otra
                    </button>
                  </>
                )}

              {(selected.status === 'CONFIRMED' || selected.status === 'IN_PROGRESS') && (
                <button
                  type="button"
                  onClick={() => {
                    setSessionApt(selected);
                    setSelected(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1FE8] text-white text-sm font-semibold hover:bg-[#1217C8]"
                >
                  <PlayCircle className="w-4 h-4" />
                  {selected.status === 'IN_PROGRESS' ? 'Continuar revisión' : 'Iniciar revisión'}
                </button>
              )}

              {(selected.status === 'CONFIRMED' ||
                selected.status === 'PENDING' ||
                (selected.status === 'RESCHEDULE_PENDING' &&
                  selected.rescheduleInitiatedBy === 'WORKSHOP')) && (
                <button
                  type="button"
                  onClick={() => openReschedule(selected)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1A1FE8]/40 text-[#1A1FE8] text-sm font-semibold hover:bg-[#1A1FE8]/5"
                >
                  <CalendarClock className="w-4 h-4" />
                  Reagendar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {sessionApt && (
        <WorkshopInspectionSessionPanel
          userId={userId}
          appointment={sessionApt}
          onClose={() => setSessionApt(null)}
          onUpdated={load}
        />
      )}

      {selected && rescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-xl ${cardClass}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Reagendar cita
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleOpen(false)}
                className="p-1 rounded-lg hover:bg-black/5"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              El cliente recibirá una notificación y deberá aceptar o proponer otra fecha.
            </p>

            {rescheduleError && (
              <p className="text-sm text-red-600 mb-3">{rescheduleError}</p>
            )}

            <label className="block text-sm font-medium mb-2">Nuevo horario disponible</label>
            <select
              value={rescheduleSlotId}
              onChange={(e) => setRescheduleSlotId(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 mb-4 ${
                theme === 'dark'
                  ? 'bg-white/5 border-blue-600/30 text-white'
                  : 'bg-white border-gray-200'
              }`}
            >
              {slots.length === 0 ? (
                <option value="">Sin cupos publicados</option>
              ) : (
                slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.date} · {slot.startTime}–{slot.endTime} ({slot.remainingCapacity} cupos)
                  </option>
                ))
              )}
            </select>

            <label className="block text-sm font-medium mb-2">Nota para el cliente (opcional)</label>
            <textarea
              value={rescheduleNote}
              onChange={(e) => setRescheduleNote(e.target.value)}
              rows={2}
              className={`w-full rounded-xl border px-4 py-3 mb-4 resize-none ${
                theme === 'dark'
                  ? 'bg-white/5 border-blue-600/30 text-white'
                  : 'bg-white border-gray-200'
              }`}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRescheduleOpen(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!slots.length || actingId === selected.id}
                onClick={handleReschedule}
                className="flex-1 py-2.5 rounded-xl bg-[#1A1FE8] text-white text-sm font-semibold hover:bg-[#1217C8] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actingId === selected.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CalendarClock className="w-4 h-4" />
                )}
                Enviar propuesta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
