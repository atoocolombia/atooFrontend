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
  History,
  PlayCircle,
  X,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSessionUser } from '../../../lib/authRouting';
import {
  fetchWorkshopAppointments,
  fetchWorkshopAvailability,
  fetchWorkshopClientHistory,
  rescheduleWorkshopAppointment,
  updateWorkshopAppointmentStatus,
  workshopProofUrl,
  type WorkshopInspectionAppointment,
} from '../../../lib/workshopPortalApi';
import type { WorkshopAvailabilitySlot } from '../../../lib/inspectionsApi';
import type { InspectionHistoryItem } from '../../../lib/inspectionsApi';
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
const TEST_OPEN_BOOKING_WORKSHOP_ID = 'TLLBOG01';
type CalendarView = 'month' | 'week' | 'day';
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function calendarDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function localDateInputValue(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function dateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

function dateKeyFromDate(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function addCalendarDays(dateKey: string, days: number): string {
  const date = dateFromKey(dateKey);
  date.setDate(date.getDate() + days);
  return dateKeyFromDate(date);
}

function weekDateKeys(dateKey: string): string[] {
  const date = dateFromKey(dateKey);
  const mondayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date);
    day.setDate(date.getDate() + index);
    return dateKeyFromDate(day);
  });
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
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [focusedDate, setFocusedDate] = useState(localDateInputValue);
  const [selected, setSelected] = useState<WorkshopInspectionAppointment | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleSlotId, setRescheduleSlotId] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState(localDateInputValue);
  const [rescheduleTime, setRescheduleTime] = useState('08:00');
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [sessionApt, setSessionApt] = useState<WorkshopInspectionAppointment | null>(null);
  const [clientHistory, setClientHistory] = useState<InspectionHistoryItem[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = async (showLoader = true) => {
    if (!userId) return;
    if (showLoader) setLoading(true);
    try {
      const [apts, availability] = await Promise.all([
        fetchWorkshopAppointments(userId),
        fetchWorkshopAvailability(userId),
      ]);
      setAppointments(apts);
      setSlots(availability.filter((s) => s.remainingCapacity > 0));
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  useEffect(() => {
    setClientHistory(null);
  }, [selected?.id]);

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

  const currentWeek = useMemo(() => weekDateKeys(focusedDate), [focusedDate]);

  const calendarHeading =
    calendarView === 'month'
      ? `${MONTHS[viewMonth.month]} ${viewMonth.year}`
      : calendarView === 'week'
        ? `${new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(dateFromKey(currentWeek[0]))} – ${new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(dateFromKey(currentWeek[6]))}`
        : new Intl.DateTimeFormat('es-CO', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(dateFromKey(focusedDate));

  const moveCalendar = (direction: -1 | 1) => {
    if (calendarView === 'month') {
      setViewMonth((current) => {
        const next = new Date(current.year, current.month + direction, 1);
        return { year: next.getFullYear(), month: next.getMonth() };
      });
      return;
    }
    setFocusedDate((current) =>
      addCalendarDays(current, direction * (calendarView === 'week' ? 7 : 1)),
    );
  };

  const goToToday = () => {
    const today = localDateInputValue();
    const date = dateFromKey(today);
    setFocusedDate(today);
    setViewMonth({ year: date.getFullYear(), month: date.getMonth() });
  };

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
    const openBooking = selected.workshopId === TEST_OPEN_BOOKING_WORKSHOP_ID;
    const slot = openBooking ? null : slots.find((s) => s.id === rescheduleSlotId);
    const appointmentDate = openBooking ? rescheduleDate : slot?.date;
    const appointmentTime = openBooking ? rescheduleTime : slot?.startTime;

    if (!appointmentDate || !appointmentTime) {
      setRescheduleError('Elige un horario disponible');
      return;
    }

    setActingId(selected.id);
    setRescheduleError(null);
    try {
      await rescheduleWorkshopAppointment(userId, selected.id, {
        appointmentDate,
        appointmentTime,
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
    setRescheduleDate(apt.proposedAppointmentDate ?? apt.appointmentDate);
    setRescheduleTime(apt.proposedAppointmentTime ?? apt.appointmentTime ?? '08:00');
    setRescheduleNote('');
    setRescheduleError(null);
  };

  const loadClientHistory = async () => {
    if (!selected) return;
    setHistoryLoading(true);
    try {
      setClientHistory(await fetchWorkshopClientHistory(userId, selected.userId));
    } catch {
      setClientHistory([]);
    } finally {
      setHistoryLoading(false);
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className={`inline-flex rounded-xl p-1 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
            {([
              ['month', 'Mes'],
              ['week', 'Semana'],
              ['day', 'Día'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCalendarView(value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  calendarView === value
                    ? 'bg-[#1A1FE8] text-white shadow-sm'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-white/5'
                      : 'text-gray-600 hover:bg-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-2 rounded-lg border border-[#1A1FE8]/30 text-[#1A1FE8] text-sm font-semibold"
          >
            Hoy
          </button>
        </div>

        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={() => moveCalendar(-1)}
            className="p-2 rounded-lg hover:bg-black/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {calendarHeading}
          </h2>
          <button
            type="button"
            onClick={() => moveCalendar(1)}
            className="p-2 rounded-lg hover:bg-black/5"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {calendarView === 'month' && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, index) => {
                if (!cell.day || !cell.dateKey) {
                  return <div key={`empty-${index}`} className="min-h-[88px]" />;
                }

                const dayAppointments = appointmentsByDate.get(cell.dateKey) ?? [];
                const isToday = cell.dateKey === localDateInputValue();

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
                    <button
                      type="button"
                      onClick={() => {
                        setFocusedDate(cell.dateKey!);
                        setCalendarView('day');
                      }}
                      className={`text-xs font-semibold mb-1 ${
                        isToday
                          ? 'text-[#1A1FE8]'
                          : theme === 'dark'
                            ? 'text-gray-400'
                            : 'text-gray-600'
                      }`}
                    >
                      {cell.day}
                    </button>
                    <div className="space-y-0.5">
                      {dayAppointments.slice(0, 3).map((appointment) => (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => setSelected(appointment)}
                          className={`w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate ${appointmentColorClass(appointment)}`}
                          title={`${appointment.clientDisplayName ?? appointment.clientEmail} · ${displayTimeForAppointment(appointment) ?? ''}`}
                        >
                          {displayTimeForAppointment(appointment) ?? '—'}{' '}
                          {(appointment.clientDisplayName ?? appointment.clientEmail ?? 'Cliente').split(' ')[0]}
                        </button>
                      ))}
                      {dayAppointments.length > 3 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFocusedDate(cell.dateKey!);
                            setCalendarView('day');
                          }}
                          className="text-[10px] text-gray-500 px-1"
                        >
                          +{dayAppointments.length - 3} más
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {calendarView === 'week' && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[760px]">
              {currentWeek.map((dateKey, index) => {
                const dayAppointments = appointmentsByDate.get(dateKey) ?? [];
                const isToday = dateKey === localDateInputValue();
                return (
                  <div
                    key={dateKey}
                    className={`min-h-[300px] rounded-xl border p-2 ${
                      isToday
                        ? 'border-[#1A1FE8]/50 bg-[#1A1FE8]/5'
                        : theme === 'dark'
                          ? 'border-blue-600/20 bg-white/[0.02]'
                          : 'border-gray-200 bg-gray-50/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFocusedDate(dateKey);
                        setCalendarView('day');
                      }}
                      className={`w-full text-center mb-3 ${isToday ? 'text-[#1A1FE8]' : ''}`}
                    >
                      <span className="block text-xs font-semibold">{WEEKDAYS[index]}</span>
                      <span className="block text-xl font-bold">{dateFromKey(dateKey).getDate()}</span>
                    </button>
                    <div className="space-y-2">
                      {dayAppointments.map((appointment) => (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => setSelected(appointment)}
                          className={`w-full text-left rounded-lg p-2 text-xs ${appointmentColorClass(appointment)}`}
                        >
                          <span className="block font-bold">{displayTimeForAppointment(appointment) ?? '—'}</span>
                          <span className="block truncate mt-1">
                            {appointment.clientDisplayName ?? appointment.clientEmail ?? 'Cliente'}
                          </span>
                        </button>
                      ))}
                      {dayAppointments.length === 0 && (
                        <p className="text-xs text-center text-gray-400 py-4">Sin citas</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {calendarView === 'day' && (
          <div className="space-y-3">
            {(appointmentsByDate.get(focusedDate) ?? []).length === 0 ? (
              <div className={`rounded-xl border border-dashed p-10 text-center ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'}`}>
                <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No hay citas programadas para este día.</p>
              </div>
            ) : (
              (appointmentsByDate.get(focusedDate) ?? [])
                .sort((first, second) =>
                  (displayTimeForAppointment(first) ?? '').localeCompare(
                    displayTimeForAppointment(second) ?? '',
                  ),
                )
                .map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => setSelected(appointment)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      theme === 'dark'
                        ? 'border-blue-600/20 bg-white/[0.02] hover:bg-white/5'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg px-3 py-2 text-center shrink-0 ${appointmentColorClass(appointment)}`}>
                        <span className="block text-sm font-bold">
                          {displayTimeForAppointment(appointment) ?? '—'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {appointment.clientDisplayName ?? appointment.clientEmail ?? 'Cliente'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {appointment.reason ?? 'Sin motivo registrado'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {appointmentLegendLabel(appointment)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        )}
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
              <button
                type="button"
                onClick={loadClientHistory}
                disabled={historyLoading}
                className="inline-flex items-center gap-2 text-[#1A1FE8] hover:underline disabled:opacity-50"
              >
                {historyLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <History className="w-4 h-4" />
                )}
                Revisiones anteriores del vehículo
              </button>
              {clientHistory && (
                <div className={`rounded-xl p-3 space-y-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                  {clientHistory.length === 0 ? (
                    <p className="text-xs text-gray-500">No hay revisiones anteriores.</p>
                  ) : (
                    clientHistory.slice(0, 5).map((item) => (
                      <div key={item.sessionId} className="text-xs border-b last:border-0 pb-2 last:pb-0">
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.vehicleName ?? 'Vehículo'} · {item.appointmentDate}
                        </p>
                        <p className="text-gray-500">
                          {item.workshopName} · {item.checklistSummary.completed}/{item.checklistSummary.total} pasos
                        </p>
                        {item.notes && <p className="text-gray-500 mt-1">{item.notes}</p>}
                      </div>
                    ))
                  )}
                </div>
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
          onUpdated={() => {
            void load(false);
          }}
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
            {selected.workshopId === TEST_OPEN_BOOKING_WORKSHOP_ID ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input
                    type="date"
                    min={localDateInputValue()}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 ${
                      theme === 'dark'
                        ? 'bg-white/5 border-blue-600/30 text-white'
                        : 'bg-white border-gray-200'
                    }`}
                  />
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 ${
                      theme === 'dark'
                        ? 'bg-white/5 border-blue-600/30 text-white'
                        : 'bg-white border-gray-200'
                    }`}
                  />
                </div>
                <p className="text-xs text-[#1A1FE8] mb-4">
                  Taller de prueba: puedes elegir cualquier hora.
                </p>
              </>
            ) : (
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
            )}

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
                disabled={
                  actingId === selected.id ||
                  (selected.workshopId === TEST_OPEN_BOOKING_WORKSHOP_ID
                    ? !rescheduleDate || !rescheduleTime
                    : !slots.length)
                }
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
