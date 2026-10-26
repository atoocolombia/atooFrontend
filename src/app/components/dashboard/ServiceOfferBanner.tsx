import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  formatCop,
  offerDeferSummary,
  respondToServiceOffer,
  type ClientBillingStatement,
  type PendingServiceOffer,
} from '../../../lib/clientBillingApi';

type ServiceOfferBannerProps = {
  offer: PendingServiceOffer | null;
  onStatementChange: (next: ClientBillingStatement) => void;
};

export function ServiceOfferBanner({ offer, onStatementChange }: ServiceOfferBannerProps) {
  const { theme } = useTheme();
  const [offerOpen, setOfferOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  if (!offer) return null;

  const handleRespond = async (accept: boolean) => {
    if (submitting) return;
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

      {offerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div
            role="dialog"
            aria-modal="true"
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border p-6 ${
              theme === 'dark' ? 'bg-[#0D0F2E] border-blue-600/30 text-white' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#1A1FE8]">{offer.title}</p>
                <h3 className="text-xl font-bold mt-1">{offer.bannerTitle}</h3>
              </div>
              <button type="button" aria-label="Cerrar" onClick={() => setOfferOpen(false)}>
                <X className="w-5 h-5 opacity-70" />
              </button>
            </div>

            <p className={`text-sm whitespace-pre-wrap mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {offer.detailBody}
            </p>

            <p className="text-sm font-medium text-[#1A1FE8] mb-4">{offerDeferSummary(offer)}</p>

            <h4 className="font-semibold mb-3">Desglose del servicio</h4>
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
                      {offer.deferMonths > 1 ? ` · Total a financiar en ${offer.deferMonths} meses` : ''}
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
          </div>
        </div>
      )}
    </>
  );
}
