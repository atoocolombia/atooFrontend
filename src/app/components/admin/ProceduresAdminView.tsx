import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ApiError } from '../../../lib/api';
import {
  adminFetchProcedureSuggestions,
  adminReviewProcedureSuggestion,
  type AdminProcedureSuggestion,
} from '../../../lib/adminInspectionsApi';

function formatCop(amount: number | null): string {
  if (amount == null || amount <= 0) return 'Sin costo';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ProceduresAdminView() {
  const { theme } = useTheme();
  const [items, setItems] = useState<AdminProcedureSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'PENDING_ADMIN' | 'ALL'>('PENDING_ADMIN');

  const [editCost, setEditCost] = useState<Record<string, string>>({});
  const [editUrgent, setEditUrgent] = useState<Record<string, boolean>>({});
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetchProcedureSuggestions(filter);
      setItems(data);
      const costs: Record<string, string> = {};
      const urgents: Record<string, boolean> = {};
      for (const item of data) {
        costs[item.id] =
          item.estimatedCostCop != null && item.estimatedCostCop > 0
            ? String(item.estimatedCostCop)
            : '';
        urgents[item.id] = item.isUrgent;
      }
      setEditCost(costs);
      setEditUrgent(urgents);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (item: AdminProcedureSuggestion, action: 'approve' | 'reject') => {
    setActingId(item.id);
    setError(null);
    setSuccess(null);
    try {
      const costRaw = (editCost[item.id] ?? '').trim();
      const cost = costRaw === '' ? null : Number(costRaw.replace(/[^\d]/g, ''));
      await adminReviewProcedureSuggestion(item.id, {
        action,
        adminNotes: (editNotes[item.id] ?? '').trim() || undefined,
        estimatedCostCop: action === 'approve' ? cost : undefined,
        isUrgent: action === 'approve' ? Boolean(editUrgent[item.id]) : undefined,
      });
      setSuccess(
        action === 'approve'
          ? cost && cost > 0
            ? editUrgent[item.id]
              ? 'Autorizado: se notificó al cliente con plazo de 1 semana.'
              : 'Autorizado: se notificó al cliente para agendar el ajuste.'
            : 'Autorizado sin costo: se realizará en la cita actual.'
          : 'Procedimiento rechazado.',
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo procesar la solicitud');
    } finally {
      setActingId(null);
    }
  };

  const cardClass = `rounded-2xl border p-5 ${
    theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20' : 'bg-white border-gray-200 shadow-sm'
  }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Autorización de procedimientos
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            El taller sugiere ajustes; tú decides si se hacen ya (sin costo) o se agendan (con costo)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('PENDING_ADMIN')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              filter === 'PENDING_ADMIN'
                ? 'bg-[#1A1FE8] text-white'
                : theme === 'dark'
                  ? 'bg-white/5 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-2 rounded-lg text-sm font-semibold ${
              filter === 'ALL'
                ? 'bg-[#1A1FE8] text-white'
                : theme === 'dark'
                  ? 'bg-white/5 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-700 text-sm flex gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          {success}
        </div>
      )}

      <div className={`rounded-xl border p-4 text-sm ${theme === 'dark' ? 'border-blue-600/20 bg-white/5' : 'border-blue-100 bg-blue-50/60'}`}>
        <p className="font-semibold text-[#1A1FE8] flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4" />
          Reglas de autorización
        </p>
        <ul className={`list-disc pl-5 space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          <li>Sin costo → se autoriza de inmediato y el taller lo hace en la misma cita.</li>
          <li>Con costo y urgente → se informa al cliente y tiene 1 semana para agendar el ajuste.</li>
          <li>Con costo sin urgencia → se informa al cliente para que agenda cuando pueda.</li>
        </ul>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
        </div>
      ) : items.length === 0 ? (
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
          No hay solicitudes {filter === 'PENDING_ADMIN' ? 'pendientes' : 'registradas'}.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className={cardClass}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1A1FE8]/15 text-[#1A1FE8]">
                      {item.workshopName}
                    </span>
                    {item.isUrgent && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-600">
                        Urgente
                      </span>
                    )}
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-600">
                      {item.status === 'PENDING_ADMIN'
                        ? 'Pendiente'
                        : item.status === 'APPROVED_IMMEDIATE'
                          ? 'Autorizado en cita'
                          : item.status === 'APPROVED_CLIENT_SCHEDULE'
                            ? 'Autorizado — agenda'
                            : 'Rechazado'}
                    </span>
                  </div>
                  <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Cliente: {item.clientDisplayName} ({item.clientEmail})
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Cita {item.appointmentDate} {item.appointmentTime ?? ''}
                  </p>
                  {item.reason && (
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Motivo visita: {item.reason}
                    </p>
                  )}
                  <p className="text-sm font-medium">
                    Costo sugerido: {formatCop(item.estimatedCostCop)}
                  </p>
                </div>

                {item.status === 'PENDING_ADMIN' && (
                  <div className="w-full lg:w-72 space-y-3 shrink-0">
                    <div>
                      <label className="block text-xs font-medium mb-1">Costo final COP</label>
                      <input
                        value={editCost[item.id] ?? ''}
                        onChange={(e) =>
                          setEditCost((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        placeholder="Vacío = sin costo"
                        className={`w-full rounded-xl border px-3 py-2 text-sm ${
                          theme === 'dark'
                            ? 'bg-white/5 border-blue-600/30 text-white'
                            : 'bg-white border-gray-200'
                        }`}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(editUrgent[item.id])}
                        onChange={(e) =>
                          setEditUrgent((prev) => ({ ...prev, [item.id]: e.target.checked }))
                        }
                        className="accent-[#1A1FE8]"
                      />
                      Urgente (plazo 1 semana si tiene costo)
                    </label>
                    <textarea
                      value={editNotes[item.id] ?? ''}
                      onChange={(e) =>
                        setEditNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      rows={2}
                      placeholder="Nota interna (opcional)"
                      className={`w-full rounded-xl border px-3 py-2 text-sm resize-none ${
                        theme === 'dark'
                          ? 'bg-white/5 border-blue-600/30 text-white'
                          : 'bg-white border-gray-200'
                      }`}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={actingId === item.id}
                        onClick={() => review(item, 'approve')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                      >
                        {actingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Autorizar
                      </button>
                      <button
                        type="button"
                        disabled={actingId === item.id}
                        onClick={() => review(item, 'reject')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 text-red-600 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
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
