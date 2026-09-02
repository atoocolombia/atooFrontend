import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, FileText, Loader2, Send, Truck } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  completeAdvisorDelivery,
  fetchAdvisorDeliveries,
  markDeliveryDocumentSigned,
  patchAdvisorDelivery,
  sendDeliveryDocuments,
  type VehicleDeliveryRecord,
} from '../../../lib/deliveriesApi';

const VEHICLE_FIELDS: Array<{ key: keyof VehicleDeliveryRecord['vehicle']; label: string }> = [
  { key: 'vin', label: 'VIN' },
  { key: 'taxPayment', label: 'Pago impuesto' },
  { key: 'soatPayment', label: 'Pago SOAT' },
  { key: 'platesChassisDecl', label: 'Placas / declaraciones chasis' },
  { key: 'engineNumber', label: 'No. motor' },
  { key: 'serialNumber', label: 'No. serie' },
  { key: 'axles', label: 'No. ejes' },
  { key: 'pbvKg', label: 'PBV KG' },
  { key: 'color', label: 'Color' },
  { key: 'fuelType', label: 'Tipo combustible' },
  { key: 'vehicleClass', label: 'Clase' },
  { key: 'brand', label: 'Marca' },
  { key: 'line', label: 'Línea' },
  { key: 'model', label: 'Modelo' },
  { key: 'bodyType', label: 'Carrocería' },
  { key: 'passengerCapacity', label: 'Capacidad pasajeros' },
  { key: 'displacement', label: 'Cilindraje' },
];

const STATUS_LABEL: Record<string, string> = {
  PENDING_DOCUMENTS: 'Pendiente documentos',
  DOCUMENTS_SENT: 'Documentos enviados',
  DOCUMENTS_SIGNED: 'Firmados',
  IN_DELIVERY: 'En entrega',
  AWAITING_CLIENT_CONFIRMATION: 'Esperando confirmación cliente',
  COMPLETED: 'Completada',
};

export function DeliveryQueueView() {
  const { theme } = useTheme();
  const [deliveries, setDeliveries] = useState<VehicleDeliveryRecord[]>([]);
  const [selected, setSelected] = useState<VehicleDeliveryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDeliveries(await fetchAdvisorDeliveries());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar entregas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cardClass =
    theme === 'dark'
      ? 'bg-[#0D0F2E]/60 border-blue-600/20 hover:border-[#1A1FE8]/40'
      : 'bg-white border-gray-200 hover:border-[#1A1FE8]/40';
  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/30 text-white'
      : 'bg-white border-gray-200 text-gray-900';

  const refreshSelected = (updated: VehicleDeliveryRecord) => {
    setSelected(updated);
    setDeliveries((rows) => rows.map((r) => (r.id === updated.id ? updated : r)));
  };

  const run = async (fn: () => Promise<VehicleDeliveryRecord>, okMsg: string) => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      refreshSelected(await fn());
      setSuccess(okMsg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Entregas de vehículos
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Clientes con solicitud aprobada o alta manual del analista
        </p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-emerald-600 text-sm">{success}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando entregas…
        </div>
      ) : deliveries.length === 0 ? (
        <p className="text-gray-500">No hay entregas pendientes.</p>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {deliveries.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setSelected(d);
                setError(null);
                setSuccess(null);
              }}
              className={`text-left rounded-2xl border p-5 transition-colors ${cardClass} ${
                selected?.id === d.id ? 'ring-2 ring-[#1A1FE8]' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {d.clientName}
                  </h3>
                  <p className="text-sm text-gray-500">CC {d.idDocumentNumber}</p>
                </div>
                <Truck className="w-5 h-5 text-[#1A1FE8] shrink-0" />
              </div>
              <p className="text-sm mt-2 text-gray-500">{d.email}</p>
              <p className="text-sm text-gray-500">{d.phone ?? 'Sin celular'}</p>
              <span className="inline-block mt-3 text-xs font-semibold px-2 py-1 rounded-full bg-[#1A1FE8]/10 text-[#1A1FE8]">
                {STATUS_LABEL[d.status] ?? d.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className={`rounded-2xl border p-6 space-y-6 ${cardClass}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selected.clientName}
              </h2>
              <p className="text-sm text-gray-500">
                {selected.email} · {selected.phone ?? 'Sin celular'} · CC {selected.idDocumentNumber}
              </p>
            </div>
            <span className="text-sm font-medium text-[#1A1FE8]">{STATUS_LABEL[selected.status]}</span>
          </div>

          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Documentos para firma
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void run(() => sendDeliveryDocuments(selected.id), 'Documentos enviados al cliente')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1FE8] text-white text-sm font-semibold disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Enviar documentos
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void run(() => markDeliveryDocumentSigned(selected.id, 'all'), 'Documentos marcados como firmados')
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500 text-emerald-600 text-sm font-semibold disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Marcar todo firmado
              </button>
            </div>
            <ul className="mt-3 text-sm text-gray-500 space-y-1">
              <li>Contrato: {selected.documents.contract.signedAt ? '✅ Firmado' : 'Pendiente'}</li>
              <li>Seguro: {selected.documents.insurance.signedAt ? '✅ Firmado' : 'Pendiente'}</li>
              <li>Pagaré: {selected.documents.promissoryNote.signedAt ? '✅ Firmado' : 'Pendiente'}</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-3">Datos del vehículo</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VEHICLE_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-medium mb-1">{label}</label>
                  <input
                    className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
                    value={selected.vehicle[key] ?? ''}
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        vehicle: { ...selected.vehicle, [key]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium mb-1">Lugar / notas de entrega</label>
              <input
                className={`w-full rounded-lg border px-3 py-2 text-sm ${inputClass}`}
                value={selected.deliveryLocation ?? ''}
                onChange={(e) => setSelected({ ...selected, deliveryLocation: e.target.value })}
              />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void run(
                  () =>
                    patchAdvisorDelivery(selected.id, {
                      ...selected.vehicle,
                      deliveryLocation: selected.deliveryLocation,
                    }),
                  'Datos del vehículo guardados',
                )
              }
              className="mt-3 px-4 py-2 rounded-xl border border-[#1A1FE8]/40 text-[#1A1FE8] text-sm font-semibold disabled:opacity-50"
            >
              Guardar datos del vehículo
            </button>
          </section>

          <section>
            <h3 className="font-semibold mb-3">Checklist de accesorios</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {selected.accessoryChecklist.map((item, idx) => (
                <label key={item.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.delivered}
                    onChange={(e) => {
                      const next = [...selected.accessoryChecklist];
                      next[idx] = { ...item, delivered: e.target.checked };
                      setSelected({ ...selected, accessoryChecklist: next });
                    }}
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                void run(
                  () => patchAdvisorDelivery(selected.id, { accessoryChecklist: selected.accessoryChecklist }),
                  'Checklist guardado',
                )
              }
              className="mt-3 px-4 py-2 rounded-xl border border-[#1A1FE8]/40 text-[#1A1FE8] text-sm font-semibold disabled:opacity-50"
            >
              Guardar checklist
            </button>
          </section>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              void run(() => completeAdvisorDelivery(selected.id), 'Entrega completada. Se envió correo al cliente.')
            }
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Completar entrega y notificar cliente
          </button>
        </div>
      )}
    </div>
  );
}
