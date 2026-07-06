import { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  User,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSessionUser } from '../../../lib/authRouting';
import {
  fetchWorkshopAppointments,
  updateWorkshopAppointmentStatus,
  workshopProofUrl,
  type WorkshopInspectionAppointment,
} from '../../../lib/workshopPortalApi';

const STATUS_LABELS: Record<WorkshopInspectionAppointment['status'], string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  REJECTED: 'Rechazada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

interface WorkshopAppointmentsViewProps {
  onUpdated?: () => void;
}

export function WorkshopAppointmentsView({ onUpdated }: WorkshopAppointmentsViewProps) {
  const { theme } = useTheme();
  const userId = getSessionUser()?.id ?? '';
  const [appointments, setAppointments] = useState<WorkshopInspectionAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setAppointments(await fetchWorkshopAppointments(userId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

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
    } finally {
      setActingId(null);
    }
  };

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
          Citas de revisión
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Solicitudes de clientes y citas planificadas por atoo
        </p>
      </div>

      {appointments.length === 0 ? (
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No hay citas registradas.</p>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className={`rounded-2xl border p-5 ${
                theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        apt.kind === 'BUSINESS_PLANNED'
                          ? 'bg-[#1A1FE8]/15 text-[#1A1FE8]'
                          : 'bg-purple-500/15 text-purple-600'
                      }`}
                    >
                      {apt.kind === 'BUSINESS_PLANNED' ? 'Planificada atoo' : 'Solicitud cliente'}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-600">
                      {STATUS_LABELS[apt.status]}
                    </span>
                  </div>

                  <p className={`font-bold text-lg flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <User className="w-4 h-4 text-[#1A1FE8]" />
                    {apt.clientDisplayName ?? apt.clientEmail ?? 'Cliente'}
                  </p>
                  <p className="text-sm text-gray-500">{apt.clientEmail}</p>

                  <p className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Calendar className="w-4 h-4" />
                    {apt.appointmentDate} · {apt.appointmentTime ?? '—'}
                  </p>

                  {apt.reason && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <strong>Motivo:</strong> {apt.reason}
                    </p>
                  )}

                  {apt.proofOriginalName && userId && (
                    <a
                      href={workshopProofUrl(userId, apt.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#1A1FE8] hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Ver prueba: {apt.proofOriginalName}
                    </a>
                  )}
                </div>

                {apt.status === 'PENDING' && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={actingId === apt.id}
                      onClick={() => handleStatus(apt.id, 'CONFIRMED')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {actingId === apt.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Confirmar
                    </button>
                    <button
                      type="button"
                      disabled={actingId === apt.id}
                      onClick={() => handleStatus(apt.id, 'REJECTED')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 text-red-600 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
