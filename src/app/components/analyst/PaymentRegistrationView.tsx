import { useCallback, useEffect, useState } from 'react';
import { CreditCard, Loader2, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchAnalystPayments,
  formatCop,
  formatPaymentDate,
  registerAnalystPayment,
  toDateTimeLocalValue,
  type ClientPaymentRecord,
} from '../../../lib/paymentsApi';

export function PaymentRegistrationView() {
  const { theme } = useTheme();
  const [idDocumentNumber, setIdDocumentNumber] = useState('');
  const [amountCop, setAmountCop] = useState('');
  const [paidAt, setPaidAt] = useState(() => toDateTimeLocalValue());
  const [notes, setNotes] = useState('');
  const [filterCedula, setFilterCedula] = useState('');
  const [payments, setPayments] = useState<ClientPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/30 text-white'
      : 'bg-white border-gray-200 text-gray-900';

  const cardClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/20 text-white'
      : 'bg-white border-gray-200 text-gray-900';

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
        amountCop: parsedAmount,
        paidAt: new Date(paidAt).toISOString(),
        notes: notes.trim() || undefined,
      });
      setSuccess(
        `Pago registrado: ${formatCop(created.amountCop)} para cédula ${created.idDocumentNumber}${
          created.clientName ? ` (${created.clientName})` : ''
        }`,
      );
      setIdDocumentNumber('');
      setAmountCop('');
      setPaidAt(toDateTimeLocalValue());
      setNotes('');
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
          Registra pagos recibidos indicando cédula del cliente, monto y fecha
        </p>
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className={`rounded-2xl border p-6 grid sm:grid-cols-2 gap-4 ${cardClass}`}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Cédula del cliente</label>
          <input
            required
            inputMode="numeric"
            className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
            value={idDocumentNumber}
            onChange={(event) => setIdDocumentNumber(event.target.value.replace(/\D/g, ''))}
            placeholder="Ej. 1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Monto (COP)</label>
          <input
            required
            inputMode="numeric"
            className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
            value={amountCop}
            onChange={(event) => setAmountCop(event.target.value.replace(/\D/g, ''))}
            placeholder="Ej. 207000"
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
          <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
          <input
            className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Referencia, banco, etc."
          />
        </div>

        {error && <p className="sm:col-span-2 text-red-500 text-sm">{error}</p>}
        {success && <p className="sm:col-span-2 text-emerald-600 text-sm">{success}</p>}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Registrar pago
          </button>
        </div>
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
                  <th className="text-left px-4 py-3 font-medium">Cédula</th>
                  <th className="text-left px-4 py-3 font-medium">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium">Monto</th>
                  <th className="text-left px-4 py-3 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-inherit">
                    <td className="px-4 py-3 whitespace-nowrap">{formatPaymentDate(payment.paidAt)}</td>
                    <td className="px-4 py-3">{payment.idDocumentNumber}</td>
                    <td className="px-4 py-3">{payment.clientName ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold">{formatCop(payment.amountCop)}</td>
                    <td className="px-4 py-3">{payment.notes ?? '—'}</td>
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
