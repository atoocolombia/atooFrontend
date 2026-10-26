import { Loader2, Receipt, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  categoryLabel,
  formatCop,
  respondToServiceOffer,
  type ClientBillingStatement,
} from '../../../lib/clientBillingApi';
import { formatNextPaymentDate } from '../../../lib/clientPaymentsApi';

type MonthlyBillingStatementProps = {
  statement: ClientBillingStatement | null;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onStatementChange: (next: ClientBillingStatement) => void;
};

export function MonthlyBillingStatement({
  statement,
  loading,
  error,
  onReload,
  onStatementChange,
}: MonthlyBillingStatementProps) {
  const { theme } = useTheme();
  const [offerOpen, setOfferOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  const cardClass =
    theme === 'dark'
      ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
      : 'bg-white border-gray-100';

  if (loading && !statement) {
    return (
      <div className={`rounded-2xl border p-8 flex justify-center ${cardClass}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
      </div>
    );
  }

  if (!statement) {
    if (error) {
      return (
        <div className={`rounded-2xl border p-6 text-sm text-red-500 ${cardClass}`}>
          {error}{' '}
          <button type="button" className="underline" onClick={() => void onReload()}>
            Reintentar
          </button>
        </div>
      );
    }
    return null;
  }

  const offer = statement.pendingOffer;

  const handleRespond = async (accept: boolean) => {
    if (!offer || submitting) return;
    setSubmitting(true);
    setOfferError(null);
    try {
      const next = await respondToServiceOffer(offer.id, accept);
      onStatementChange(next);
      setOfferOpen(false);
    } catch (err) {
      setOfferError(err instanceof Error ? err.message : 'No se pudo guardar tu respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {offer && (
        <button
          type="button"
          onClick={() => setOfferOpen(true)}
          className="w-full text-left rounded-2xl border border-[#1A1FE8]/40 bg-gradient-to-r from-[#1A1FE8]/15 to-indigo-500/10 p-5 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#1A1FE8] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#1A1FE8]">
                Nuevo servicio disponible
              </p>
              <p className={`text-lg font-bold mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {offer.bannerTitle}
              </p>
              {offer.bannerSubtitle && (
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {offer.bannerSubtitle}
                </p>
              )}
              <p className="text-sm text-[#1A1FE8] font-medium mt-2">Toca para ver detalle y aceptar o rechazar</p>
            </div>
          </div>
        </button>
      )}

      <div className={`rounded-2xl shadow-lg p-8 border ${cardClass}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#1A1FE8]/10 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-[#1A1FE8]" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Cuenta de cobro
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {statement.periodLabel}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between gap-4 py-2 border-b border-inherit">
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {statement.baseInstallmentLabel}
            </span>
            <span className={`font-semibold tabular-nums ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatCop(statement.baseInstallmentCop)}
            </span>
          </div>

          {statement.extras.length === 0 ? (
            <p className={`text-sm py-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Sin cargos adicionales activos en este periodo.
            </p>
          ) : (
            statement.extras.map((line) => (
              <div key={line.id} className="flex justify-between gap-4 py-2 border-b border-inherit/50">
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {line.label}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {categoryLabel(line.category)}
                    {line.description ? ` · ${line.description}` : ''}
                  </p>
                </div>
                <span className={`font-semibold tabular-nums shrink-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCop(line.amountCop)}
                </span>
              </div>
            ))
          )}

          {statement.extras.length > 0 && (
            <div className="flex justify-between gap-4 py-2 text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Subtotal servicios extras</span>
              <span className="font-medium tabular-nums">{formatCop(statement.extrasSubtotalCop)}</span>
            </div>
          )}

          <div className="flex justify-between gap-4 pt-4 mt-2 border-t-2 border-[#1A1FE8]/30">
            <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Total del periodo
            </span>
            <span className="text-2xl font-bold text-[#1A1FE8] tabular-nums">
              {formatCop(statement.totalDueCop)}
            </span>
          </div>

          {statement.nextPaymentDueAt && (
            <p className={`text-sm pt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Referencia de vencimiento: {formatNextPaymentDate(statement.nextPaymentDueAt)}
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 mt-4">
            {error}{' '}
            <button type="button" className="underline" onClick={() => void onReload()}>
              Reintentar
            </button>
          </p>
        )}
      </div>

      {offerOpen && offer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offer-title"
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border p-6 ${
              theme === 'dark' ? 'bg-[#0D0F2E] border-blue-600/30 text-white' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#1A1FE8]">{offer.title}</p>
                <h3 id="offer-title" className="text-xl font-bold mt-1">
                  {offer.bannerTitle}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                className="p-1 rounded-lg opacity-70 hover:opacity-100"
                onClick={() => setOfferOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-sm whitespace-pre-wrap mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {offer.detailBody}
            </p>

            <h4 className="font-semibold mb-3">Costos adicionales en tu cuenta de cobro</h4>
            <ul className="space-y-2 mb-6">
              {offer.extraItems.map((item) => (
                <li
                  key={`${item.label}-${item.amountCop}`}
                  className={`rounded-xl px-4 py-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between gap-3 font-medium">
                    <span>{item.label}</span>
                    <span className="tabular-nums">{formatCop(item.amountCop)}</span>
                  </div>
                  {item.description && (
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {offerError && <p className="text-sm text-red-500 mb-4">{offerError}</p>}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleRespond(false)}
                className={`flex-1 py-3 rounded-xl border font-semibold disabled:opacity-50 ${
                  theme === 'dark' ? 'border-blue-600/40' : 'border-gray-300'
                }`}
              >
                No, gracias
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleRespond(true)}
                className="flex-1 py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold disabled:opacity-50"
              >
                {submitting ? 'Guardando…' : 'Aceptar servicio'}
              </button>
            </div>
            <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Al aceptar, los cargos se suman a tu cuenta de cobro mensual. Puedes consultar el detalle arriba en todo
              momento.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
