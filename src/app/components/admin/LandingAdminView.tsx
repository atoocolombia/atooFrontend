import { useCallback, useEffect, useState } from 'react';
import { ImagePlus, Loader2, Save, Star, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  adminDeleteVehicleImage,
  adminFetchCatalogVehicles,
  adminFetchLandingSettings,
  adminSetPrimaryVehicleImage,
  adminUpdateCatalogVehicle,
  adminUpdateLandingSettings,
  adminUploadVehicleImage,
  type AdminCatalogVehicle,
} from '../../../lib/landingApi';
import { ApiError } from '../../../lib/api';
import { formatCop } from '../../data/vehicles';
import { ImageWithFallback } from '../figma/ImageWithFallback';

type VehicleForm = {
  name: string;
  subtitle: string;
  type: 'carro' | 'camioneta';
  badge: string;
  weeklyPriceCop: number;
  popular: boolean;
  active: boolean;
  sortOrder: number;
  highlightsText: string;
  featuresText: string;
  specsText: string;
};

function vehicleToForm(v: AdminCatalogVehicle): VehicleForm {
  return {
    name: v.name,
    subtitle: v.subtitle,
    type: v.type,
    badge: v.badge ?? '',
    weeklyPriceCop: v.weeklyPriceCop,
    popular: v.popular,
    active: v.active,
    sortOrder: v.sortOrder,
    highlightsText: v.highlights.join('\n'),
    featuresText: v.features.join('\n'),
    specsText: v.specs.map((s) => `${s.label} | ${s.value}`).join('\n'),
  };
}

function parseLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseSpecs(text: string) {
  return parseLines(text).map((line) => {
    const [label, ...rest] = line.split('|');
    return { label: label?.trim() ?? line, value: rest.join('|').trim() || '—' };
  });
}

export function LandingAdminView() {
  const { theme } = useTheme();
  const [maxVisible, setMaxVisible] = useState(10);
  const [vehicles, setVehicles] = useState<AdminCatalogVehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selected = vehicles.find((v) => v.id === selectedId) ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [settings, list] = await Promise.all([
        adminFetchLandingSettings(),
        adminFetchCatalogVehicles(),
      ]);
      setMaxVisible(settings.maxVisibleVehicles);
      setVehicles(list);
      setSelectedId((prev) => prev ?? list[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar la landing');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const v = vehicles.find((item) => item.id === selectedId);
    if (v) setForm(vehicleToForm(v));
  }, [selectedId, vehicles]);

  const cardClass =
    theme === 'dark'
      ? 'bg-white/[0.04] border-white/[0.08] text-white'
      : 'bg-white border-gray-200 text-gray-900';

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
      : 'bg-gray-50 border-gray-200 text-gray-900';

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await adminUpdateLandingSettings(maxVisible);
      setMessage('Ajustes de la landing guardados.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar ajustes');
    } finally {
      setSaving(false);
    }
  };

  const saveVehicle = async () => {
    if (!selected || !form) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await adminUpdateCatalogVehicle(selected.id, {
        name: form.name,
        subtitle: form.subtitle,
        type: form.type,
        badge: form.badge.trim() || null,
        weeklyPriceCop: form.weeklyPriceCop,
        popular: form.popular,
        active: form.active,
        sortOrder: form.sortOrder,
        highlights: parseLines(form.highlightsText),
        features: parseLines(form.featuresText),
        specs: parseSpecs(form.specsText),
      });
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setMessage(`Vehículo "${updated.name}" actualizado.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al guardar vehículo');
    } finally {
      setSaving(false);
    }
  };

  const onUploadImages = async (files: FileList | null) => {
    if (!selected || !files?.length) return;
    setUploading(true);
    setError('');
    try {
      let latest = selected;
      for (const file of Array.from(files)) {
        latest = await adminUploadVehicleImage(selected.id, file, latest.images.length === 0);
      }
      setVehicles((prev) => prev.map((v) => (v.id === latest.id ? latest : v)));
      setMessage(`${files.length} imagen(es) subida(s).`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const onDeleteImage = async (imageId: string) => {
    if (!selected) return;
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      const updated = await adminDeleteVehicleImage(selected.id, imageId);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setMessage('Imagen eliminada.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar imagen');
    }
  };

  const onSetPrimary = async (imageId: string) => {
    if (!selected) return;
    try {
      const updated = await adminSetPrimaryVehicleImage(selected.id, imageId);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al marcar imagen principal');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#1A1FE8]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Landing page
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Administra los vehículos visibles en la página principal, su información y galería de fotos.
        </p>
      </div>

      {(message || error) && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            error
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {error || message}
        </div>
      )}

      <section className={`rounded-2xl border p-6 ${cardClass}`}>
        <h2 className="text-lg font-semibold mb-4">Visibilidad en la landing</h2>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Cantidad máxima de vehículos a mostrar
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={maxVisible}
              onChange={(e) => setMaxVisible(Number(e.target.value))}
              className={`w-32 px-3 py-2 rounded-lg border ${inputClass}`}
            />
          </div>
          <button
            type="button"
            onClick={() => void saveSettings()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1FE8] text-white rounded-lg font-medium hover:bg-[#1217C8] disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            Guardar ajustes
          </button>
        </div>
        <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Solo se muestran vehículos marcados como activos, ordenados por prioridad.
        </p>
      </section>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className={`rounded-2xl border p-4 space-y-2 ${cardClass}`}>
          <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide opacity-70">Vehículos</h3>
          {vehicles.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedId(v.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedId === v.id
                  ? 'bg-[#1A1FE8] text-white'
                  : theme === 'dark'
                    ? 'hover:bg-white/5 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="font-medium truncate">{v.name}</div>
              <div className="text-xs opacity-75">{v.active ? 'Activo' : 'Oculto'} · {formatCop(v.weeklyPriceCop)}/sem</div>
            </button>
          ))}
        </aside>

        {selected && form && (
          <div className="space-y-6">
            <section className={`rounded-2xl border p-6 space-y-4 ${cardClass}`}>
              <h2 className="text-lg font-semibold">Información del vehículo</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-1 block">Nombre</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Subtítulo</label>
                  <input
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as 'carro' | 'camioneta' })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
                  >
                    <option value="carro">Carro</option>
                    <option value="camioneta">Camioneta / SUV</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm mb-1 block">Precio semanal (COP)</label>
                  <input
                    type="number"
                    value={form.weeklyPriceCop}
                    onChange={(e) => setForm({ ...form, weeklyPriceCop: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Badge (opcional)</label>
                  <input
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="Más Popular"
                    className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>
                <div>
                  <label className="text-sm mb-1 block">Orden</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  Visible en landing
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                  />
                  Destacado (popular)
                </label>
              </div>

              <div>
                <label className="text-sm mb-1 block">Lo mejor que ofrece (una línea por ítem)</label>
                <textarea
                  rows={4}
                  value={form.highlightsText}
                  onChange={(e) => setForm({ ...form, highlightsText: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block">Características (una línea por ítem)</label>
                <textarea
                  rows={3}
                  value={form.featuresText}
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block">Ficha técnica — formato: Etiqueta | Valor</label>
                <textarea
                  rows={5}
                  value={form.specsText}
                  onChange={(e) => setForm({ ...form, specsText: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
                />
              </div>

              <button
                type="button"
                onClick={() => void saveVehicle()}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1FE8] text-white rounded-lg font-semibold hover:bg-[#1217C8] disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar vehículo
              </button>
            </section>

            <section className={`rounded-2xl border p-6 ${cardClass}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold">Galería de fotos</h2>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1FE8]/15 text-[#1A1FE8] border border-[#1A1FE8]/30 rounded-lg cursor-pointer hover:bg-[#1A1FE8]/25">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  <span className="text-sm font-medium">Agregar fotos</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      void onUploadImages(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {selected.images.length === 0 ? (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  Sin imágenes. Sube fotos para el carrusel de la landing.
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selected.images.map((img) => (
                    <div
                      key={img.id}
                      className={`relative rounded-xl overflow-hidden border group ${
                        img.isPrimary ? 'border-[#1A1FE8] ring-2 ring-[#1A1FE8]/30' : 'border-white/10'
                      }`}
                    >
                      <div className="aspect-[4/3]">
                        <ImageWithFallback src={img.url} alt={img.originalName} className="w-full h-full object-cover" />
                      </div>
                      {img.isPrimary && (
                        <span className="absolute top-2 left-2 text-xs bg-[#1A1FE8] text-white px-2 py-0.5 rounded-full">
                          Principal
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => void onSetPrimary(img.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-white/20 text-white rounded-lg hover:bg-white/30"
                          >
                            <Star className="w-3.5 h-3.5" />
                            Principal
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void onDeleteImage(img.id)}
                          className="flex items-center justify-center p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
