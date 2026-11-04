import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, Loader2, Mail, XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchPendingApplications,
  rejectApplication,
  type PendingApplication,
} from '../../../lib/deliveriesApi';
import {
  BACKGROUND_CHECK_LINKS,
  enablePracticalTestScheduling,
  patchApplicationBackgroundChecks,
  type BackgroundCheckId,
} from '../../../lib/practicalTestApi';

const BG_KEYS: Record<
  BackgroundCheckId,
  { approved: keyof PendingApplication; comment: keyof PendingApplication }
> = {
  judicial: { approved: 'backgroundJudicialApproved', comment: 'backgroundJudicialComment' },
  procuraduria: { approved: 'backgroundProcuraduriaApproved', comment: 'backgroundProcuraduriaComment' },
  simit: { approved: 'backgroundSimitApproved', comment: 'backgroundSimitComment' },
};

function allChecksApproved(app: PendingApplication): boolean {
  return (
    app.backgroundJudicialApproved === true &&
    app.backgroundProcuraduriaApproved === true &&
    app.backgroundSimitApproved === true
  );
}

export function PendingApplicationsLiveView() {
  const { theme } = useTheme();
  const [rows, setRows] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftComments, setDraftComments] = useState<Record<string, Record<string, string>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchPendingApplications());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cardClass =
    theme === 'dark' ? 'bg-[#0D0F2E]/60 border-blue-600/20' : 'bg-white border-gray-200';

  const setCheck = async (app: PendingApplication, checkId: BackgroundCheckId, approved: boolean) => {
    setBusyId(app.id);
    setError(null);
    try {
      const comment = draftComments[app.id]?.[checkId] ?? (app[BG_KEYS[checkId].comment] as string | null) ?? '';
      const updated = await patchApplicationBackgroundChecks(app.id, {
        [checkId]: { approved, comment: approved ? '' : comment },
      });
      setRows((list) => list.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setBusyId(null);
    }
  };

  const enableScheduling = async (appId: string) => {
    setBusyId(appId);
    setError(null);
    try {
      await enablePracticalTestScheduling(appId);
      setRows((r) => r.filter((x) => x.id !== appId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo habilitar');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt('Motivo del rechazo (opcional)') ?? undefined;
    setBusyId(id);
    setError(null);
    try {
      await rejectApplication(id, reason);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo rechazar');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Solicitudes pendientes
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Revisa antecedentes en los enlaces oficiales y habilita la cita práctica por correo
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">No hay solicitudes pendientes.</p>
      ) : (
        <div className="space-y-6">
          {rows.map((app) => (
            <div key={app.id} className={`rounded-2xl border p-5 ${cardClass}`}>
              <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {app.clientName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">CC {app.idDocumentNumber ?? '—'}</p>
              <p className="text-sm text-gray-500">{app.email}</p>
              <p className="text-sm text-gray-500">{app.phone ?? 'Sin celular'}</p>
              <p className="text-sm text-gray-500">{app.address ?? 'Sin dirección'}</p>

              {app.knowledgeTest && (
                <p className="text-sm text-gray-500 mt-2">
                  Teóricas — Ponderado: {app.knowledgeTest.weightedScore}% (Vial {app.knowledgeTest.vialScore}% · Servicio{' '}
                  {app.knowledgeTest.customerServiceScore}%)
                </p>
              )}

              <div className="mt-4 space-y-3">
                <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Revisión de antecedentes
                </h4>
                {BACKGROUND_CHECK_LINKS.map((check) => {
                  const approved = app[BG_KEYS[check.id].approved] as boolean | null;
                  return (
                    <div
                      key={check.id}
                      className={`rounded-lg border p-3 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
                    >
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <a
                          href={check.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#1A1FE8] inline-flex items-center gap-1"
                        >
                          {check.label} <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={busyId === app.id}
                            onClick={() => void setCheck(app, check.id, true)}
                            className={`px-2 py-1 text-xs rounded ${approved === true ? 'bg-emerald-600 text-white' : 'border border-emerald-500 text-emerald-600'}`}
                          >
                            Aprobar
                          </button>
                          <button
                            type="button"
                            disabled={busyId === app.id}
                            onClick={() => void setCheck(app, check.id, false)}
                            className={`px-2 py-1 text-xs rounded ${approved === false ? 'bg-red-600 text-white' : 'border border-red-400 text-red-500'}`}
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                      {approved === false && (
                        <input
                          type="text"
                          placeholder="Comentario obligatorio si rechazas"
                          className="mt-2 w-full text-sm border rounded px-2 py-1"
                          value={draftComments[app.id]?.[check.id] ?? (app[BG_KEYS[check.id].comment] as string) ?? ''}
                          onChange={(e) =>
                            setDraftComments((prev) => ({
                              ...prev,
                              [app.id]: { ...prev[app.id], [check.id]: e.target.value },
                            }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  disabled={busyId === app.id || !allChecksApproved(app)}
                  onClick={() => void enableScheduling(app.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1A1FE8] text-white text-sm font-semibold disabled:opacity-50"
                  title={!allChecksApproved(app) ? 'Aprueba las 3 revisiones primero' : undefined}
                >
                  <Mail className="w-4 h-4" /> Habilitar cita práctica (correo)
                </button>
                <button
                  type="button"
                  disabled={busyId === app.id}
                  onClick={() => void reject(app.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-red-400 text-red-500 text-sm font-semibold disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Rechazar solicitud
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
