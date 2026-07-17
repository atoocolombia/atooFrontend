import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  completeWorkshopInspectionSession,
  startWorkshopInspectionSession,
  suggestWorkshopProcedure,
  updateWorkshopChecklistItem,
  type WorkshopInspectionAppointment,
} from '../../../lib/workshopPortalApi';
import type { InspectionSession } from '../../../lib/inspectionsApi';

interface WorkshopInspectionSessionPanelProps {
  userId: string;
  appointment: WorkshopInspectionAppointment;
  onClose: () => void;
  onUpdated: () => void;
}

const SUGGESTION_STATUS: Record<string, string> = {
  PENDING_ADMIN: 'Pendiente de admin',
  APPROVED_IMMEDIATE: 'Autorizado en cita',
  APPROVED_CLIENT_SCHEDULE: 'Autorizado — agenda cliente',
  REJECTED: 'Rechazado',
};

export function WorkshopInspectionSessionPanel({
  userId,
  appointment,
  onClose,
  onUpdated,
}: WorkshopInspectionSessionPanelProps) {
  const { theme } = useTheme();
  const [session, setSession] = useState<InspectionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [sugTitle, setSugTitle] = useState('');
  const [sugDescription, setSugDescription] = useState('');
  const [sugCost, setSugCost] = useState('');
  const [sugUrgent, setSugUrgent] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');

  const cardClass =
    theme === 'dark'
      ? 'bg-[#0D0F2E] border-blue-600/30'
      : 'bg-white border-gray-200';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await startWorkshopInspectionSession(userId, appointment.id);
        if (!cancelled) {
          setSession(data);
          onUpdated();
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'No se pudo iniciar la revisión');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, appointment.id]);

  const toggleItem = async (itemId: string, completed: boolean) => {
    if (!session || session.status !== 'IN_PROGRESS') return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateWorkshopChecklistItem(
        userId,
        appointment.id,
        itemId,
        completed,
      );
      setSession(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el paso');
    } finally {
      setSaving(false);
    }
  };

  const submitSuggestion = async () => {
    if (!sugTitle.trim()) {
      setError('Indica el procedimiento sugerido');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const costRaw = sugCost.trim();
      const cost = costRaw === '' ? null : Number(costRaw.replace(/[^\d]/g, ''));
      const updated = await suggestWorkshopProcedure(userId, appointment.id, {
        title: sugTitle.trim(),
        description: sugDescription.trim() || undefined,
        estimatedCostCop: cost,
        isUrgent: sugUrgent,
      });
      setSession(updated);
      setShowSuggestionForm(false);
      setSugTitle('');
      setSugDescription('');
      setSugCost('');
      setSugUrgent(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la sugerencia');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await completeWorkshopInspectionSession(
        userId,
        appointment.id,
        completeNotes.trim() || undefined,
      );
      setSession(updated);
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cerrar la revisión');
    } finally {
      setSaving(false);
    }
  };

  const completedCount = session?.checklistItems.filter((i) => i.completed).length ?? 0;
  const totalCount = session?.checklistItems.length ?? 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl ${cardClass}`}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 p-5 border-b border-black/5 bg-inherit">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#1A1FE8]">
              Revisión en curso
            </p>
            <h3 className={`text-xl font-bold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {appointment.clientDisplayName ?? appointment.clientEmail ?? 'Cliente'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {appointment.appointmentDate} · {appointment.appointmentTime ?? '—'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-black/5">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Motivo de la visita</p>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {session?.reason || appointment.reason || 'Sin motivo registrado'}
                </p>
              </div>

              {session && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4
                        className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                      >
                        <ClipboardList className="w-4 h-4 text-[#1A1FE8]" />
                        Pasos de la revisión
                      </h4>
                      <span className="text-xs text-gray-500">
                        {completedCount}/{totalCount} completados
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {session.checklistItems.map((item) => (
                        <li key={item.id}>
                          <label
                            className={`flex items-start gap-3 rounded-xl border px-3 py-3 cursor-pointer transition-colors ${
                              item.completed
                                ? theme === 'dark'
                                  ? 'border-emerald-500/30 bg-emerald-500/10'
                                  : 'border-emerald-200 bg-emerald-50'
                                : theme === 'dark'
                                  ? 'border-blue-600/20 bg-white/[0.02]'
                                  : 'border-gray-200 bg-white'
                            } ${session.status !== 'IN_PROGRESS' ? 'opacity-80 cursor-default' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              disabled={session.status !== 'IN_PROGRESS' || saving}
                              onChange={(e) => toggleItem(item.id, e.target.checked)}
                              className="mt-1 w-4 h-4 accent-[#1A1FE8]"
                            />
                            <span className="min-w-0">
                              <span
                                className={`block text-sm font-semibold ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}
                              >
                                {item.title}
                              </span>
                              {item.description && (
                                <span className="block text-xs text-gray-500 mt-0.5">
                                  {item.description}
                                </span>
                              )}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ¿Se requiere un procedimiento adicional?
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Solo si es necesario. El admin autorizará antes de aplicarlo.
                        </p>
                      </div>
                      {session.status === 'IN_PROGRESS' && (
                        <button
                          type="button"
                          onClick={() => setShowSuggestionForm((v) => !v)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#1A1FE8] border border-[#1A1FE8]/30 hover:bg-[#1A1FE8]/5"
                        >
                          <Plus className="w-4 h-4" />
                          {showSuggestionForm ? 'Ocultar' : 'Sugerir'}
                        </button>
                      )}
                    </div>

                    {showSuggestionForm && session.status === 'IN_PROGRESS' && (
                      <div className="mt-4 space-y-3">
                        <input
                          value={sugTitle}
                          onChange={(e) => setSugTitle(e.target.value)}
                          placeholder="Nombre del procedimiento"
                          className={`w-full rounded-xl border px-4 py-3 ${
                            theme === 'dark'
                              ? 'bg-white/5 border-blue-600/30 text-white'
                              : 'bg-white border-gray-200'
                          }`}
                        />
                        <textarea
                          value={sugDescription}
                          onChange={(e) => setSugDescription(e.target.value)}
                          rows={2}
                          placeholder="Detalle técnico (opcional)"
                          className={`w-full rounded-xl border px-4 py-3 resize-none ${
                            theme === 'dark'
                              ? 'bg-white/5 border-blue-600/30 text-white'
                              : 'bg-white border-gray-200'
                          }`}
                        />
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            value={sugCost}
                            onChange={(e) => setSugCost(e.target.value)}
                            placeholder="Costo estimado COP (vacío = sin costo)"
                            className={`w-full rounded-xl border px-4 py-3 ${
                              theme === 'dark'
                                ? 'bg-white/5 border-blue-600/30 text-white'
                                : 'bg-white border-gray-200'
                            }`}
                          />
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={sugUrgent}
                              onChange={(e) => setSugUrgent(e.target.checked)}
                              className="accent-[#1A1FE8]"
                            />
                            Es urgente
                          </label>
                        </div>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={submitSuggestion}
                          className="w-full py-2.5 rounded-xl bg-[#1A1FE8] text-white text-sm font-semibold hover:bg-[#1217C8] disabled:opacity-50"
                        >
                          Enviar a autorización del admin
                        </button>
                      </div>
                    )}

                    {session.suggestions.length > 0 && (
                      <ul className="mt-4 space-y-2">
                        {session.suggestions.map((s) => (
                          <li
                            key={s.id}
                            className={`rounded-lg px-3 py-2 text-sm ${
                              theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium">{s.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {s.estimatedCostCop != null && s.estimatedCostCop > 0
                                    ? `$${s.estimatedCostCop.toLocaleString('es-CO')}`
                                    : 'Sin costo'}
                                  {s.isUrgent ? ' · Urgente' : ''}
                                </p>
                              </div>
                              <span className="text-xs font-semibold text-gray-500 shrink-0">
                                {SUGGESTION_STATUS[s.status] ?? s.status}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {session.status === 'IN_PROGRESS' ? (
                    <div className="space-y-3">
                      <textarea
                        value={completeNotes}
                        onChange={(e) => setCompleteNotes(e.target.value)}
                        rows={2}
                        placeholder="Notas finales de la revisión (opcional)"
                        className={`w-full rounded-xl border px-4 py-3 resize-none ${
                          theme === 'dark'
                            ? 'bg-white/5 border-blue-600/30 text-white'
                            : 'bg-white border-gray-200'
                        }`}
                      />
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleComplete}
                        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {saving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                        Finalizar revisión
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-700 text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Revisión completada
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
