import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, Plus, Sparkles, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  adminCreateServiceOffer,
  adminFetchServiceOffers,
  adminUpdateServiceOffer,
  offerItemsTotalCop,
  type AdminServiceOffer,
  type ServiceOfferExtraItem,
} from '../../../lib/adminServiceOffersApi';
import { formatCop } from '../../../lib/paymentsApi';
import { ApiError } from '../../../lib/api';

const emptyItem = (): ServiceOfferExtraItem => ({ label: '', amountCop: 0, description: '' });

export function ServiceOffersAdminView() {
  const { theme } = useTheme();
  const [offers, setOffers] = useState<AdminServiceOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [detailBody, setDetailBody] = useState('');
  const [deferMonths, setDeferMonths] = useState('1');
  const [items, setItems] = useState<ServiceOfferExtraItem[]>([emptyItem()]);

  const card =
    theme === 'dark'
      ? 'bg-[#0D0F2E] border border-blue-600/20 text-white'
      : 'bg-white border border-gray-200 text-gray-900 shadow-sm';

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/30 text-white placeholder:text-gray-500'
      : 'bg-white border-gray-200 text-gray-900';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOffers(await adminFetchServiceOffers());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las ofertas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setTitle('');
    setBannerTitle('');
    setBannerSubtitle('');
    setDetailBody('');
    setDeferMonths('1');
    setItems([emptyItem()]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const parsedItems = items
        .map((row) => ({
          label: row.label.trim(),
          amountCop: Number(String(row.amountCop).replace(/\D/g, '')),
          description: row.description?.trim() || undefined,
        }))
        .filter((row) => row.label && row.amountCop > 0);

      if (parsedItems.length === 0) {
        setError('Agrega al menos un cargo con nombre y monto.');
        return;
      }

      await adminCreateServiceOffer({
        title: title.trim(),
        bannerTitle: bannerTitle.trim(),
        bannerSubtitle: bannerSubtitle.trim() || undefined,
        detailBody: detailBody.trim(),
        extraItems: parsedItems,
        deferMonths: Math.max(1, Number(deferMonths) || 1),
        active: true,
      });
      setSuccess('Oferta creada. Los clientes que aún no respondieron la verán en Pagos.');
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la oferta');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (offer: AdminServiceOffer) => {
    setError(null);
    try {
      await adminUpdateServiceOffer(offer.id, { active: !offer.active });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar');
    }
  };

  const totalPreview = offerItemsTotalCop(
    items.map((i) => ({
      ...i,
      amountCop: Number(String(i.amountCop).replace(/\D/g, '')) || 0,
    })),
  );
  const months = Math.max(1, Number(deferMonths) || 1);
  const monthlyPreview = months > 1 ? Math.ceil(totalPreview / months) : totalPreview;

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Ofertas de servicio
        </h1>
        <p className={`mt-2 text-sm max-w-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Crea extras que aparecen como banner en la sección <strong>Pagos</strong> del cliente. Si
          acepta, el cargo se suma a su cuenta de cobro (en un mes o en cuotas).
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-600 text-sm flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-800 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={(e) => void handleCreate(e)} className={`rounded-2xl border p-6 space-y-5 ${card}`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#1A1FE8]" />
          <h2 className="text-lg font-semibold">Nueva oferta</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Nombre interno</label>
            <input
              required
              className={`w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Asistencia vial premium"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Título del banner</label>
            <input
              required
              className={`w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
              value={bannerTitle}
              onChange={(e) => setBannerTitle(e.target.value)}
              placeholder="¿Quieres grúa ilimitada en ruta?"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium mb-1">Subtítulo del banner (opcional)</label>
            <input
              className={`w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
              value={bannerSubtitle}
              onChange={(e) => setBannerSubtitle(e.target.value)}
              placeholder="Servicio nuevo para clientes atoo"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium mb-1">Detalle (popup al tocar el banner)</label>
            <textarea
              required
              rows={4}
              className={`w-full rounded-xl border px-3 py-2 text-sm resize-none ${inputClass}`}
              value={detailBody}
              onChange={(e) => setDetailBody(e.target.value)}
              placeholder="Describe qué incluye el servicio y condiciones..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Cuotas en cuenta de cobro</label>
            <select
              className={`w-full rounded-xl border px-3 py-2 text-sm ${inputClass}`}
              value={deferMonths}
              onChange={(e) => setDeferMonths(e.target.value)}
            >
              <option value="1">1 — cargo completo el próximo mes</option>
              {[2, 3, 4, 6, 9, 12].map((m) => (
                <option key={m} value={String(m)}>
                  {m} meses — pago diferido
                </option>
              ))}
            </select>
          </div>
          <div className={`rounded-xl border px-3 py-2 text-sm ${inputClass}`}>
            <p className="text-xs text-gray-500">Vista previa cobro</p>
            <p className="font-semibold mt-1">
              Total cargos: {formatCop(totalPreview)}
              {months > 1 && (
                <span className="block text-xs font-normal text-gray-500 mt-0.5">
                  ≈ {formatCop(monthlyPreview)} / mes durante {months} meses
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Cargos incluidos en la oferta</p>
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, emptyItem()])}
              className="inline-flex items-center gap-1 text-sm text-[#1A1FE8] font-medium"
            >
              <Plus className="w-4 h-4" /> Agregar línea
            </button>
          </div>
          {items.map((row, idx) => (
            <div key={idx} className="grid sm:grid-cols-12 gap-2 items-start">
              <input
                className={`sm:col-span-4 rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                placeholder="Nombre del cargo"
                value={row.label}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r)),
                  )
                }
              />
              <input
                className={`sm:col-span-3 rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                placeholder="Monto COP"
                inputMode="numeric"
                value={row.amountCop ? String(row.amountCop) : ''}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((r, i) =>
                      i === idx ? { ...r, amountCop: Number(e.target.value.replace(/\D/g, '')) } : r,
                    ),
                  )
                }
              />
              <input
                className={`sm:col-span-4 rounded-xl border px-3 py-2 text-sm ${inputClass}`}
                placeholder="Descripción (opcional)"
                value={row.description ?? ''}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((r, i) => (i === idx ? { ...r, description: e.target.value } : r)),
                  )
                }
              />
              {items.length > 1 && (
                <button
                  type="button"
                  className="sm:col-span-1 p-2 text-red-500"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                  aria-label="Quitar línea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1FE8] text-white font-semibold disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Publicar oferta a clientes
        </button>
      </form>

      <div className={`rounded-2xl border p-6 ${card}`}>
        <h2 className="text-lg font-semibold mb-4">Ofertas publicadas</h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
          </div>
        ) : offers.length === 0 ? (
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Aún no hay ofertas. La primera activa se mostrará a quien no haya respondido.
          </p>
        ) : (
          <ul className="space-y-4">
            {offers.map((offer) => {
              const total = offerItemsTotalCop(offer.extraItems);
              return (
                <li
                  key={offer.id}
                  className={`rounded-xl border p-4 ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'}`}
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-semibold">{offer.bannerTitle}</p>
                      <p className="text-xs text-gray-500">{offer.title}</p>
                      <p className="text-sm mt-2">
                        {offer.extraItems.map((i) => i.label).join(' · ')} — {formatCop(total)}
                        {offer.deferMonths > 1 && ` en ${offer.deferMonths} cuotas`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {offer.decisionsCount} respuesta(s) · Creada{' '}
                        {new Date(offer.createdAt).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleActive(offer)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${
                        offer.active
                          ? 'border-emerald-500/40 text-emerald-700 bg-emerald-50'
                          : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {offer.active ? (
                        <>
                          <ToggleRight className="w-5 h-5" /> Activa
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5" /> Inactiva
                        </>
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
