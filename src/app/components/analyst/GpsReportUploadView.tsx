import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MapPin, Search, Upload } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchAnalystGpsReports,
  uploadAnalystGpsReport,
  type GpsReportSummary,
} from '../../../lib/analystGpsApi';
import { formatGpsPeriod } from '../../../lib/clientGpsApi';
import {
  searchPaymentClients,
  type ClientPaymentLookup,
} from '../../../lib/paymentsApi';

export function GpsReportUploadView() {
  const { theme } = useTheme();
  const [clientSearch, setClientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ClientPaymentLookup[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchSeq = useRef(0);

  const [clientUserId, setClientUserId] = useState<string | null>(null);
  const [clientLabel, setClientLabel] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [reports, setReports] = useState<GpsReportSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/30 text-white'
      : 'bg-white border-gray-200 text-gray-900';

  const cardClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/20'
      : 'bg-white border-gray-200 shadow-sm';

  const loadReports = useCallback(async (userId?: string | null) => {
    setLoadingList(true);
    try {
      const rows = await fetchAnalystGpsReports(userId ?? undefined);
      setReports(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el historial');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadReports(clientUserId);
  }, [clientUserId, loadReports]);

  useEffect(() => {
    const q = clientSearch.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const seq = ++searchSeq.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        setSearching(true);
        try {
          const rows = await searchPaymentClients(q);
          if (seq === searchSeq.current) setSearchResults(rows);
        } catch {
          if (seq === searchSeq.current) setSearchResults([]);
        } finally {
          if (seq === searchSeq.current) setSearching(false);
        }
      })();
    }, 280);
    return () => window.clearTimeout(timer);
  }, [clientSearch]);

  const pickClient = (row: ClientPaymentLookup) => {
    setClientUserId(row.userId);
    setClientLabel(`${row.clientName} · ${row.idDocumentNumber}`);
    setClientSearch(`${row.clientName} · ${row.idDocumentNumber}`);
    setShowResults(false);
  };

  const onSubmit = async () => {
    if (!clientUserId || !file) {
      setError('Selecciona cliente y archivo CSV/TXT de la empresa GPS.');
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);
    setWarnings([]);
    try {
      const result = await uploadAnalystGpsReport({
        userId: clientUserId,
        file,
        analystNotes: notes,
      });
      setSuccess('Informe GPS cargado. El cliente ya puede verlo en Mi vehículo.');
      setWarnings(result.warnings);
      setFile(null);
      setNotes('');
      await loadReports(clientUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el informe');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Informes GPS
        </h1>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Sube el archivo que envía la empresa de rastreo (CSV o TXT) y asígnalo al cliente del
          vehículo. Extraemos ubicación, recorrido y métricas para mostrarlas en su dashboard.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-800 dark:text-emerald-100 text-sm flex gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          {success}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-950 dark:text-amber-100 text-sm">
          <p className="font-semibold mb-1">Avisos al procesar el archivo</p>
          <ul className="list-disc pl-5 space-y-1">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={`rounded-2xl border p-6 space-y-4 ${cardClass}`}>
        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Nueva carga
        </h2>

        <div className="relative">
          <label className="block text-xs font-medium mb-1">Cliente</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setShowResults(true);
                if (!e.target.value.trim()) setClientUserId(null);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Nombre, correo o cédula"
              className={`w-full rounded-xl border pl-10 pr-3 py-2 text-sm ${inputClass}`}
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#1A1FE8]" />
            )}
          </div>
          {showResults && searchResults.length > 0 && (
            <ul
              className={`absolute z-20 mt-1 w-full rounded-xl border shadow-lg max-h-48 overflow-y-auto ${
                theme === 'dark' ? 'bg-[#0D0F2E] border-blue-600/30' : 'bg-white border-gray-200'
              }`}
            >
              {searchResults
                .filter((row) => row.userId)
                .map((row) => (
                <li key={row.userId!}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-[#1A1FE8]/10"
                    onClick={() => pickClient(row)}
                  >
                    {row.clientName} · {row.idDocumentNumber}
                    {row.email ? ` · ${row.email}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Archivo GPS</label>
          <input
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={`w-full text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Exporta desde la plataforma del proveedor como CSV. Columnas habituales: fecha, placa,
            VIN, latitud, longitud, dirección, velocidad, kilometraje.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1">Nota interna (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={`w-full rounded-xl border px-3 py-2 text-sm resize-none ${inputClass}`}
            placeholder="Ej. Informe semanal 20–26 oct"
          />
        </div>

        <button
          type="button"
          disabled={uploading || !clientUserId || !file}
          onClick={() => void onSubmit()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1FE8] text-white font-semibold disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Subir y publicar al cliente
        </button>
      </div>

      <div className={`rounded-2xl border p-6 ${cardClass}`}>
        <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {clientUserId ? `Historial — ${clientLabel}` : 'Últimas cargas'}
        </h2>
        {loadingList ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
          </div>
        ) : reports.length === 0 ? (
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Aún no hay informes GPS cargados.
          </p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li
                key={r.id}
                className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'}`}
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.clientDisplayName ?? r.userId}</p>
                    <p className="text-xs text-gray-500">
                      {r.vehicleName ?? 'Vehículo'} · {r.originalFileName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {r.lastLocation ?? 'Sin dirección en archivo'}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{formatGpsPeriod(r.periodFrom, r.periodTo)}</p>
                    <p className="text-xs text-gray-500">
                      Subido {new Date(r.uploadedAt).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
