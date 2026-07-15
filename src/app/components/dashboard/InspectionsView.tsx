import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  MapPin,
  Wrench,
  Lock,
  Upload,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSessionUser } from '../../../lib/authRouting';
import {
  fetchInspectionAppointments,
  fetchVehicleInspectionPlan,
  fetchWorkshopSlots,
  fetchWorkshops,
  requestInspectionAppointment,
  respondToReschedule,
  type InspectionAppointment,
  type VehicleInspectionPlan,
  type WorkshopAvailabilitySlot,
  type WorkshopSummary,
} from '../../../lib/inspectionsApi';

const STATUS_LABELS: Record<InspectionAppointment['status'], string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rechazada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  RESCHEDULE_PENDING: 'Nueva fecha propuesta',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function InspectionsView() {
  const { theme } = useTheme();
  const user = getSessionUser();
  const userId = user?.id ?? '';

  const [plan, setPlan] = useState<VehicleInspectionPlan | null>(null);
  const [workshops, setWorkshops] = useState<WorkshopSummary[]>([]);
  const [appointments, setAppointments] = useState<InspectionAppointment[]>([]);
  const [slots, setSlots] = useState<WorkshopAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [workshopId, setWorkshopId] = useState('');
  const [slotId, setSlotId] = useState('');
  const [reason, setReason] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [counterSlotId, setCounterSlotId] = useState('');
  const [counterForId, setCounterForId] = useState<string | null>(null);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === slotId) ?? null,
    [slots, slotId],
  );

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [planData, workshopData, appointmentData] = await Promise.all([
        fetchVehicleInspectionPlan(userId),
        fetchWorkshops(userId),
        fetchInspectionAppointments(userId),
      ]);
      setPlan(planData);
      setWorkshops(workshopData);
      setAppointments(appointmentData);
      if (!workshopId && workshopData[0]) {
        setWorkshopId(workshopData[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos cargar las revisiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  useEffect(() => {
    if (!userId || !workshopId) {
      setSlots([]);
      setSlotId('');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await fetchWorkshopSlots(userId, workshopId);
        if (!cancelled) {
          setSlots(data);
          setSlotId(data[0]?.id ?? '');
        }
      } catch {
        if (!cancelled) setSlots([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, workshopId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !workshopId || !selectedSlot || !reason.trim() || !proof) {
      setError('Completa taller, horario, motivo y adjunta la prueba');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await requestInspectionAppointment(userId, {
        workshopId,
        appointmentDate: selectedSlot.date,
        appointmentTime: selectedSlot.startTime,
        reason: reason.trim(),
        proof,
      });
      setSuccess('Tu solicitud fue enviada. El taller la revisará pronto.');
      setReason('');
      setProof(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingReschedule = useMemo(
    () =>
      appointments.filter(
        (a) =>
          a.status === 'RESCHEDULE_PENDING' &&
          a.rescheduleInitiatedBy === 'WORKSHOP' &&
          a.proposedAppointmentDate,
      ),
    [appointments],
  );

  const handleAcceptReschedule = async (appointmentId: string) => {
    if (!userId) return;
    setRespondingId(appointmentId);
    setError(null);
    try {
      await respondToReschedule(userId, appointmentId, { action: 'accept' });
      setSuccess('Aceptaste la nueva fecha. Tu cita quedó confirmada.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar la fecha');
    } finally {
      setRespondingId(null);
    }
  };

  const handleCounterReschedule = async (apt: InspectionAppointment) => {
    if (!userId) return;
    const slot = slots.find((s) => s.id === counterSlotId);
    if (!slot) {
      setError('Elige un horario alternativo');
      return;
    }

    setRespondingId(apt.id);
    setError(null);
    try {
      await respondToReschedule(userId, apt.id, {
        action: 'counter',
        appointmentDate: slot.date,
        appointmentTime: slot.startTime,
      });
      setSuccess('Enviaste una contra-propuesta al taller.');
      setCounterForId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la propuesta');
    } finally {
      setRespondingId(null);
    }
  };

  const openCounterForm = async (apt: InspectionAppointment) => {
    setCounterForId(apt.id);
    setWorkshopId(apt.workshopId);
    try {
      const data = await fetchWorkshopSlots(userId, apt.workshopId);
      setSlots(data);
      setCounterSlotId(data[0]?.id ?? '');
    } catch {
      setCounterSlotId('');
    }
  };

  const cardClass = `rounded-2xl border p-6 transition-colors ${
    theme === 'dark'
      ? 'bg-[#0D0F2E]/50 border-blue-600/20'
      : 'bg-white border-gray-200 shadow-sm'
  }`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#1A1FE8] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Revisiones Técnico-Mecánicas
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Consulta tu próxima revisión obligatoria y solicita cita en un taller asociado
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {pendingReschedule.map((apt) => (
        <div
          key={apt.id}
          className="rounded-2xl border border-violet-500/40 bg-violet-500/10 p-5 space-y-4"
        >
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-violet-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-violet-900">El taller propuso reagendar tu cita</p>
              <p className="text-sm text-violet-800 mt-1">
                {apt.workshopName} sugiere el{' '}
                <strong>
                  {apt.proposedAppointmentDate} {apt.proposedAppointmentTime ?? ''}
                </strong>{' '}
                en lugar del {apt.appointmentDate} {apt.appointmentTime ?? ''}.
              </p>
            </div>
          </div>

          {counterForId === apt.id ? (
            <div className="space-y-3 pl-9">
              <select
                value={counterSlotId}
                onChange={(e) => setCounterSlotId(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-blue-600/30 text-white'
                    : 'bg-white border-gray-200'
                }`}
              >
                {slots.length === 0 ? (
                  <option value="">Sin cupos disponibles</option>
                ) : (
                  slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.date} · {slot.startTime}–{slot.endTime}
                    </option>
                  ))
                )}
              </select>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={respondingId === apt.id || !slots.length}
                  onClick={() => handleCounterReschedule(apt)}
                  className="px-4 py-2 rounded-lg bg-[#1A1FE8] text-white text-sm font-semibold disabled:opacity-50"
                >
                  {respondingId === apt.id ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : (
                    'Enviar otra fecha'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setCounterForId(null)}
                  className="px-4 py-2 rounded-lg border text-sm font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pl-9">
              <button
                type="button"
                disabled={respondingId === apt.id}
                onClick={() => handleAcceptReschedule(apt.id)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {respondingId === apt.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Aceptar nueva fecha
              </button>
              <button
                type="button"
                onClick={() => openCounterForm(apt)}
                className="px-4 py-2 rounded-lg border border-[#1A1FE8]/40 text-[#1A1FE8] text-sm font-semibold"
              >
                Proponer otra fecha
              </button>
            </div>
          )}
        </div>
      ))}

      <div className={cardClass}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1A1FE8]/15 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#1A1FE8]" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Próxima revisión asignada al entregar tu vehículo
            </h2>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Esta fecha la define atoo y no puede modificarse
            </p>
          </div>
        </div>

        {plan ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Vehículo</p>
              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {plan.vehicleName}
              </p>
              {plan.vin && <p className="text-sm text-gray-500 mt-1">VIN: {plan.vin}</p>}
            </div>
            <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Fecha límite</p>
              <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatDate(plan.nextInspectionDueAt)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Entregado: {formatDate(plan.deliveredAt)}
              </p>
            </div>
          </div>
        ) : (
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Aún no tienes una fecha de revisión asignada. Se programará al entregar tu vehículo.
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={handleSubmit} className={cardClass}>
          <div className="flex items-center gap-3 mb-5">
            <Wrench className="w-5 h-5 text-[#1A1FE8]" />
            <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Solicitar cita en taller
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Taller asociado</label>
              <select
                value={workshopId}
                onChange={(e) => setWorkshopId(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-blue-600/30 text-white'
                    : 'bg-white border-gray-200'
                }`}
              >
                {workshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.city}
                  </option>
                ))}
              </select>
              {workshops.find((w) => w.id === workshopId) && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {workshops.find((w) => w.id === workshopId)?.address}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fecha y horario disponible</label>
              <select
                value={slotId}
                onChange={(e) => setSlotId(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 ${
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Motivo de la visita</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Ej. Revisión técnico-mecánica anual, ruido en frenos..."
                className={`w-full rounded-xl border px-4 py-3 resize-none ${
                  theme === 'dark'
                    ? 'bg-white/5 border-blue-600/30 text-white'
                    : 'bg-white border-gray-200'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Prueba o soporte</label>
              <label
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'border-blue-600/30 hover:border-[#1A1FE8]/50'
                    : 'border-gray-200 hover:border-[#1A1FE8]/40'
                }`}
              >
                <Upload className="w-6 h-6 text-[#1A1FE8]" />
                <span className="text-sm text-gray-500">
                  {proof ? proof.name : 'Sube foto o PDF (SOAT, comparendo, etc.)'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !slots.length}
              className="w-full py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold hover:bg-[#1217C8] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
              Enviar solicitud
            </button>
          </div>
        </form>

        <div className={cardClass}>
          <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Mis citas
          </h2>
          {appointments.length === 0 ? (
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No tienes citas registradas aún.
            </p>
          ) : (
            <ul className="space-y-3">
              {appointments.map((apt) => (
                <li
                  key={apt.id}
                  className={`rounded-xl p-4 border ${
                    theme === 'dark' ? 'border-blue-600/20 bg-white/5' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {apt.workshopName}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {apt.status === 'RESCHEDULE_PENDING' && apt.proposedAppointmentDate
                          ? `${apt.proposedAppointmentDate} ${apt.proposedAppointmentTime ?? ''} (propuesta)`
                          : `${apt.appointmentDate} ${apt.appointmentTime ?? ''}`}
                      </p>
                      {apt.reason && (
                        <p className="text-sm mt-2 text-gray-500">{apt.reason}</p>
                      )}
                      <p className="text-xs mt-2 text-gray-400">
                        {apt.kind === 'BUSINESS_PLANNED' ? 'Planificada por atoo' : 'Solicitada por ti'}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                        apt.status === 'CONFIRMED'
                          ? 'bg-green-500/15 text-green-600'
                          : apt.status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-600'
                            : apt.status === 'RESCHEDULE_PENDING'
                              ? 'bg-violet-500/15 text-violet-600'
                              : apt.status === 'REJECTED'
                                ? 'bg-red-500/15 text-red-600'
                                : 'bg-gray-500/15 text-gray-600'
                      }`}
                    >
                      {STATUS_LABELS[apt.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
