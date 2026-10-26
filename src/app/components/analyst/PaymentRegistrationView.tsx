import { useCallback, useEffect, useRef, useState } from 'react';
import { CreditCard, Loader2, Search, UserRound } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchAnalystPayments,
  formatCop,
  formatPaymentDate,
  ID_DOCUMENT_TYPES,
  lookupClientByDocument,
  PAYMENT_METHOD_OPTIONS,
  registerAnalystPayment,
  searchPaymentClients,
  toDateTimeLocalValue,
  type ClientPaymentLookup,
  type ClientPaymentRecord,
} from '../../../lib/paymentsApi';
import { createAnalystBillingExtra } from '../../../lib/analystBillingApi';

export function PaymentRegistrationView() {
  const { theme } = useTheme();
  const [clientSearch, setClientSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ClientPaymentLookup[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchSeq = useRef(0);

  const [idDocumentNumber, setIdDocumentNumber] = useState('');
  const [idDocumentType, setIdDocumentType] = useState('CC');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [amountCop, setAmountCop] = useState('');
  const [paidAt, setPaidAt] = useState(() => toDateTimeLocalValue());
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [paymentReference, setPaymentReference] = useState('');
  const [payerName, setPayerName] = useState('');
  const [notes, setNotes] = useState('');
  const [filterCedula, setFilterCedula] = useState('');
  const [payments, setPayments] = useState<ClientPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clientFoundInDb, setClientFoundInDb] = useState<boolean | null>(null);
  const [clientUserId, setClientUserId] = useState<string | null>(null);
  const [extraLabel, setExtraLabel] = useState('');
  const [extraAmount, setExtraAmount] = useState('');
  const [extraCategory, setExtraCategory] = useState('insurance');
  const [extraSaving, setExtraSaving] = useState(false);

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/30 text-white'
      : 'bg-white border-gray-200 text-gray-900';

  const cardClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/20 text-white'
      : 'bg-white border-gray-200 text-gray-900';

  const applyClientLookup = useCallback((row: ClientPaymentLookup) => {
    setIdDocumentNumber(row.idDocumentNumber);
    setIdDocumentType(row.idDocumentType);
    setClientName(row.clientName);
    setClientEmail(row.email ?? '');
    setClientPhone(row.phone ?? '');
    setClientAddress(row.address ?? '');
    setClientFoundInDb(true);
    setClientUserId(row.userId);
    setClientSearch(`${row.clientName} · ${row.idDocumentNumber}`);
    setShowResults(false);
  }, []);

  const loadPayments = useCallback(async (cedula?: string) => {
    setLoading(true);
    try {
      const rows = await fetchAnalystPayments(cedula);
      setPayments(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los pagos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

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
          if (seq !== searchSeq.current) return;
          setSearchResults(rows);
          setShowResults(true);
        } catch {
          if (seq !== searchSeq.current) return;
          setSearchResults([]);
        } finally {
          if (seq === searchSeq.current) setSearching(false);
        }
      })();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [clientSearch]);

  const handleDocumentBlur = async () => {
    const digits = idDocumentNumber.replace(/\D/g, '');
    if (digits.length < 5) return;
    try {
      const row = await lookupClientByDocument(digits);
      setClientFoundInDb(row.found);
      if (row.found) {
        setIdDocumentType(row.idDocumentType);
        if (row.clientName) setClientName(row.clientName);
        if (row.email) setClientEmail(row.email);
        if (row.phone) setClientPhone(row.phone);
        if (row.address) setClientAddress(row.address);
        setClientUserId(row.userId);
      }
    } catch {
      setClientFoundInDb(null);
    }
  };

  const resetForm = () => {
    setClientSearch('');
    setIdDocumentNumber('');
    setIdDocumentType('CC');
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setAmountCop('');
    setPaidAt(toDateTimeLocalValue());
    setPaymentMethod('transferencia');
    setPaymentReference('');
    setPayerName('');
    setNotes('');
    setClientFoundInDb(null);
    setClientUserId(null);
    setExtraLabel('');
    setExtraAmount('');
  };

  const handleAddBillingExtra = async () => {
    if (!clientUserId) {
      setError('Este cliente no tiene usuario en la plataforma; no se puede agregar cargo recurrente.');
      return;
    }
    const amount = Number(extraAmount.replace(/\D/g, ''));
    if (!extraLabel.trim() || !amount) {
      setError('Indica nombre y monto del cargo extra');
      return;
    }
    setExtraSaving(true);
    setError(null);
    try {
      await createAnalystBillingExtra(clientUserId, {
        label: extraLabel.trim(),
        amountCop: amount,
        category: extraCategory,
      });
      setSuccess('Cargo agregado a la cuenta de cobro del cliente.');
      setExtraLabel('');
      setExtraAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cargo');
    } finally {
      setExtraSaving(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const parsedAmount = Number(amountCop.replace(/\D/g, ''));
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Ingresa un monto válido');
      setSaving(false);
      return;
    }

    try {
      const created = await registerAnalystPayment({
        idDocumentNumber,
        idDocumentType,
        amountCop: parsedAmount,
        paidAt: new Date(paidAt).toISOString(),
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim() || undefined,
        clientAddress: clientAddress.trim() || undefined,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        payerName: payerName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccess(
        `Pago registrado: ${formatCop(created.amountCop)} — ${created.clientName ?? created.idDocumentNumber}. Registrado por ${created.registeredByEmail ?? 'analista'}.`,
      );
      resetForm();
      await loadPayments(filterCedula || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el pago');
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    await loadPayments(filterCedula || undefined);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Registro de pagos
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Busca al cliente por nombre o cédula, confirma datos para facturación electrónica y registra el
          pago. Quién registra queda asociado a tu sesión de analista.
        </p>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className={`rounded-2xl border p-6 space-y-5 ${cardClass}`}
      >
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Buscar cliente (nombre o cédula)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              className={`w-full rounded-xl border pl-10 pr-4 py-3 ${inputClass}`}
              value={clientSearch}
              onChange={(event) => setClientSearch(event.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="Ej. Juan Pérez o 1234567890"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin opacity-60" />
            )}
          </div>
          {showResults && searchResults.length > 0 && (
            <ul
              className={`absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border shadow-lg ${
                theme === 'dark' ? 'bg-[#0D0F2E] border-blue-600/30' : 'bg-white border-gray-200'
              }`}
            >
              {searchResults.map((row) => (
                <li key={`${row.idDocumentNumber}-${row.source}`}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-[#1A1FE8]/10 border-b border-inherit last:border-0"
                    onClick={() => applyClientLookup(row)}
                  >
                    <span className="font-medium block">{row.clientName}</span>
                    <span className="text-xs opacity-70">
                      {row.idDocumentType} {row.idDocumentNumber}
                      {row.email ? ` · ${row.email}` : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo documento</label>
            <select
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={idDocumentType}
              onChange={(event) => setIdDocumentType(event.target.value)}
            >
              {ID_DOCUMENT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Número documento</label>
            <input
              required
              inputMode="numeric"
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={idDocumentNumber}
              onChange={(event) => setIdDocumentNumber(event.target.value.replace(/\D/g, ''))}
              onBlur={() => void handleDocumentBlur()}
              placeholder="Sin puntos ni espacios"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Nombre completo (factura)</label>
            <input
              required
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input
              required
              type="email"
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={clientEmail}
              onChange={(event) => setClientEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={clientPhone}
              onChange={(event) => setClientPhone(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Dirección (recomendado DIAN)</label>
            <input
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={clientAddress}
              onChange={(event) => setClientAddress(event.target.value)}
              placeholder="Ciudad, barrio, dirección"
            />
          </div>
        </div>

        {clientFoundInDb === true && (
          <p className="text-sm text-emerald-600 flex items-center gap-2">
            <UserRound className="w-4 h-4" /> Datos cargados desde la base de atoo (puedes editarlos).
          </p>
        )}
        {clientUserId && (
          <div className={`rounded-xl border p-4 space-y-3 ${theme === 'dark' ? 'border-blue-600/30 bg-white/5' : 'border-blue-100 bg-blue-50/50'}`}>
            <p className="text-sm font-semibold">Cargo en cuenta de cobro (mensual)</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                className={`rounded-xl border px-3 py-2 sm:col-span-2 ${inputClass}`}
                placeholder="Ej. Seguro adicional"
                value={extraLabel}
                onChange={(e) => setExtraLabel(e.target.value)}
              />
              <select
                className={`rounded-xl border px-3 py-2 ${inputClass}`}
                value={extraCategory}
                onChange={(e) => setExtraCategory(e.target.value)}
              >
                <option value="insurance">Seguro</option>
                <option value="service">Servicio</option>
                <option value="other">Otro</option>
              </select>
              <input
                className={`rounded-xl border px-3 py-2 ${inputClass}`}
                placeholder="Monto COP"
                inputMode="numeric"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value.replace(/\D/g, ''))}
              />
              <button
                type="button"
                disabled={extraSaving}
                onClick={() => void handleAddBillingExtra()}
                className="sm:col-span-2 rounded-xl bg-[#1A1FE8] text-white py-2 font-medium disabled:opacity-50"
              >
                {extraSaving ? 'Guardando…' : 'Agregar a cuenta de cobro'}
              </button>
            </div>
          </div>
        )}

        {clientFoundInDb === false && idDocumentNumber.length >= 5 && (
          <p className="text-sm text-amber-600">
            No encontramos este documento en la base; completa nombre y correo para la factura.
          </p>
        )}

        <div className="border-t border-inherit pt-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Monto (COP)</label>
            <input
              required
              inputMode="numeric"
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={amountCop}
              onChange={(event) => setAmountCop(event.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha y hora del pago</label>
            <input
              required
              type="datetime-local"
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={paidAt}
              onChange={(event) => setPaidAt(event.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Medio de pago</label>
            <select
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              {PAYMENT_METHOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Referencia / comprobante</label>
            <input
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={paymentReference}
              onChange={(event) => setPaymentReference(event.target.value)}
              placeholder="Últimos dígitos, # transacción"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Quién realizó el pago (si no es el titular)
            </label>
            <input
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={payerName}
              onChange={(event) => setPayerName(event.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Notas internas</label>
            <input
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-emerald-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Registrar pago
        </button>
      </form>

      <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
        <div className="p-4 border-b border-inherit flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Pagos registrados</h2>
          <form onSubmit={(event) => void handleSearch(event)} className="flex gap-2">
            <input
              className={`rounded-xl border px-3 py-2 text-sm min-w-[180px] ${inputClass}`}
              value={filterCedula}
              onChange={(event) => setFilterCedula(event.target.value.replace(/\D/g, ''))}
              placeholder="Filtrar por cédula"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1FE8] text-white text-sm font-medium"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
          </form>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
          </div>
        ) : payments.length === 0 ? (
          <p className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay pagos registrados todavía.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={theme === 'dark' ? 'bg-white/5 text-gray-300' : 'bg-gray-50 text-gray-600'}>
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Fecha pago</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Documento</th>
                  <th className="text-left px-4 py-3 font-medium">Monto</th>
                  <th className="text-left px-4 py-3 font-medium">Medio</th>
                  <th className="text-left px-4 py-3 font-medium">Registró</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-inherit">
                    <td className="px-4 py-3 whitespace-nowrap">{formatPaymentDate(payment.paidAt)}</td>
                    <td className="px-4 py-3">
                      <div>{payment.clientName ?? '—'}</div>
                      <div className="text-xs opacity-70">{payment.clientEmail ?? ''}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {payment.idDocumentType} {payment.idDocumentNumber}
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatCop(payment.amountCop)}</td>
                    <td className="px-4 py-3">{payment.paymentMethod ?? '—'}</td>
                    <td className="px-4 py-3 text-xs">{payment.registeredByEmail ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
