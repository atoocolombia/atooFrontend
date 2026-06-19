import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import {
  adminFetchLandingContent,
  adminUpdateLandingContent,
} from '../../../lib/landingApi';
import { ApiError } from '../../../lib/api';
import {
  BENEFIT_ICON_OPTIONS,
  defaultLandingContent,
  STEP_ICON_OPTIONS,
  type BenefitItem,
  type ContactSectionContent,
  type LandingContent,
  type StepItem,
} from '../../data/landingContent';

type ContentTab = 'benefits' | 'steps' | 'contact';

type Props = {
  tab: ContentTab;
  theme: 'light' | 'dark';
  cardClass: string;
  inputClass: string;
  onMessage: (msg: string) => void;
  onError: (msg: string) => void;
};

function SectionHeaderFields({
  fields,
  inputClass,
}: {
  fields: Array<{ label: string; value: string; onChange: (v: string) => void; multiline?: boolean }>;
  inputClass: string;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {fields.map(({ label, value, onChange, multiline }) =>
        multiline ? (
          <div key={label} className="sm:col-span-2">
            <label className="text-sm mb-1 block">{label}</label>
            <textarea
              rows={2}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
            />
          </div>
        ) : (
          <div key={label}>
            <label className="text-sm mb-1 block">{label}</label>
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
            />
          </div>
        ),
      )}
    </div>
  );
}

export function LandingContentAdminPanel({ tab, theme, cardClass, inputClass, onMessage, onError }: Props) {
  const [content, setContent] = useState<LandingContent>(defaultLandingContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    onError('');
    try {
      const data = await adminFetchLandingContent();
      setContent(data);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'No se pudo cargar el contenido');
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    onMessage('');
    onError('');
    try {
      const updated = await adminUpdateLandingContent(content);
      setContent(updated);
      onMessage('Contenido guardado correctamente.');
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Error al guardar contenido');
    } finally {
      setSaving(false);
    }
  };

  const updateBenefits = (patch: Partial<LandingContent['benefits']>) => {
    setContent((prev) => ({ ...prev, benefits: { ...prev.benefits, ...patch } }));
  };

  const updateSteps = (patch: Partial<LandingContent['steps']>) => {
    setContent((prev) => ({ ...prev, steps: { ...prev.steps, ...patch } }));
  };

  const updateContact = (patch: Partial<ContactSectionContent>) => {
    setContent((prev) => ({ ...prev, contact: { ...prev.contact, ...patch } }));
  };

  const updateBenefitItem = (index: number, patch: Partial<BenefitItem>) => {
    setContent((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        items: prev.benefits.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      },
    }));
  };

  const addBenefitItem = () => {
    setContent((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        items: [
          ...prev.benefits.items,
          {
            icon: 'shield',
            title: 'Nuevo beneficio',
            description: '',
            gradient: 'from-[#1A1FE8] to-[#3D42F0]',
          },
        ],
      },
    }));
  };

  const removeBenefitItem = (index: number) => {
    setContent((prev) => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        items: prev.benefits.items.filter((_, i) => i !== index),
      },
    }));
  };

  const updateStepItem = (index: number, patch: Partial<StepItem>) => {
    setContent((prev) => ({
      ...prev,
      steps: {
        ...prev.steps,
        items: prev.steps.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      },
    }));
  };

  const addStepItem = () => {
    const next = String(content.steps.items.length + 1).padStart(2, '0');
    setContent((prev) => ({
      ...prev,
      steps: {
        ...prev.steps,
        items: [
          ...prev.steps.items,
          { number: next, icon: 'file-text', title: 'Nuevo paso', description: '' },
        ],
      },
    }));
  };

  const removeStepItem = (index: number) => {
    setContent((prev) => ({
      ...prev,
      steps: {
        ...prev.steps,
        items: prev.steps.items.filter((_, i) => i !== index),
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-[#1A1FE8]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { benefits, steps, contact } = content;

  return (
    <div className="space-y-6">
      {tab === 'benefits' && (
        <section className={`rounded-2xl border p-6 space-y-6 ${cardClass}`}>
          <h2 className="text-lg font-semibold">Sección de beneficios</h2>
          <SectionHeaderFields
            inputClass={inputClass}
            fields={[
              { label: 'Etiqueta superior', value: benefits.badge, onChange: (v) => updateBenefits({ badge: v }) },
              { label: 'Título (antes del destacado)', value: benefits.titleBefore, onChange: (v) => updateBenefits({ titleBefore: v }) },
              { label: 'Título destacado', value: benefits.titleHighlight, onChange: (v) => updateBenefits({ titleHighlight: v }) },
              { label: 'Título (después del destacado)', value: benefits.titleAfter, onChange: (v) => updateBenefits({ titleAfter: v }) },
              { label: 'Descripción', value: benefits.description, onChange: (v) => updateBenefits({ description: v }), multiline: true },
            ]}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Beneficios</h3>
              <button
                type="button"
                onClick={addBenefitItem}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-[#1A1FE8] text-white hover:bg-[#1217C8]"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>
            {benefits.items.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl border p-4 space-y-3 ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Beneficio {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeBenefitItem(index)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                    aria-label="Eliminar beneficio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1 block">Icono</label>
                    <select
                      value={item.icon}
                      onChange={(e) => updateBenefitItem(index, { icon: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                    >
                      {BENEFIT_ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block">Gradiente (clases Tailwind)</label>
                    <input
                      value={item.gradient}
                      onChange={(e) => updateBenefitItem(index, { gradient: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs mb-1 block">Título</label>
                    <input
                      value={item.title}
                      onChange={(e) => updateBenefitItem(index, { title: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs mb-1 block">Descripción</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateBenefitItem(index, { description: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'steps' && (
        <section className={`rounded-2xl border p-6 space-y-6 ${cardClass}`}>
          <h2 className="text-lg font-semibold">Sección ¿Cómo funciona?</h2>
          <SectionHeaderFields
            inputClass={inputClass}
            fields={[
              { label: 'Etiqueta superior', value: steps.badge, onChange: (v) => updateSteps({ badge: v }) },
              { label: 'Título (antes del destacado)', value: steps.titleBefore, onChange: (v) => updateSteps({ titleBefore: v }) },
              { label: 'Título destacado', value: steps.titleHighlight, onChange: (v) => updateSteps({ titleHighlight: v }) },
              { label: 'Título (después del destacado)', value: steps.titleAfter, onChange: (v) => updateSteps({ titleAfter: v }) },
              { label: 'Descripción', value: steps.description, onChange: (v) => updateSteps({ description: v }), multiline: true },
              { label: 'Texto del botón', value: steps.ctaText, onChange: (v) => updateSteps({ ctaText: v }) },
              { label: 'Nota bajo el botón', value: steps.ctaNote, onChange: (v) => updateSteps({ ctaNote: v }) },
            ]}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Pasos</h3>
              <button
                type="button"
                onClick={addStepItem}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-[#1A1FE8] text-white hover:bg-[#1217C8]"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar
              </button>
            </div>
            {steps.items.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl border p-4 space-y-3 ${
                  theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Paso {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeStepItem(index)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                    aria-label="Eliminar paso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1 block">Número</label>
                    <input
                      value={item.number}
                      onChange={(e) => updateStepItem(index, { number: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block">Icono</label>
                    <select
                      value={item.icon}
                      onChange={(e) => updateStepItem(index, { icon: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                    >
                      {STEP_ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs mb-1 block">Título</label>
                    <input
                      value={item.title}
                      onChange={(e) => updateStepItem(index, { title: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs mb-1 block">Descripción</label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateStepItem(index, { description: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${inputClass}`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'contact' && (
        <section className={`rounded-2xl border p-6 space-y-6 ${cardClass}`}>
          <h2 className="text-lg font-semibold">Datos de contacto (CTA)</h2>
          <SectionHeaderFields
            inputClass={inputClass}
            fields={[
              { label: 'Etiqueta superior', value: contact.badge, onChange: (v) => updateContact({ badge: v }) },
              { label: 'Título (antes del destacado)', value: contact.titleBefore, onChange: (v) => updateContact({ titleBefore: v }) },
              { label: 'Título destacado', value: contact.titleHighlight, onChange: (v) => updateContact({ titleHighlight: v }) },
              { label: 'Título (después del destacado)', value: contact.titleAfter, onChange: (v) => updateContact({ titleAfter: v }) },
              {
                label: 'Descripción (usa {count} para el número de conductores)',
                value: contact.description,
                onChange: (v) => updateContact({ description: v }),
                multiline: true,
              },
              { label: 'Texto destacado ({count})', value: contact.driverCount, onChange: (v) => updateContact({ driverCount: v }) },
              { label: 'Etiqueta teléfono', value: contact.phoneLabel, onChange: (v) => updateContact({ phoneLabel: v }) },
              { label: 'Teléfono', value: contact.phone, onChange: (v) => updateContact({ phone: v }) },
              { label: 'Etiqueta email', value: contact.emailLabel, onChange: (v) => updateContact({ emailLabel: v }) },
              { label: 'Email', value: contact.email, onChange: (v) => updateContact({ email: v }) },
            ]}
          />
          <div>
            <label className="text-sm mb-1 block">Indicadores de confianza (uno por línea)</label>
            <textarea
              rows={3}
              value={contact.trustItems.join('\n')}
              onChange={(e) =>
                updateContact({
                  trustItems: e.target.value
                    .split('\n')
                    .map((l) => l.trim())
                    .filter(Boolean),
                })
              }
              className={`w-full px-3 py-2 rounded-lg border ${inputClass}`}
            />
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1FE8] text-white rounded-lg font-semibold hover:bg-[#1217C8] disabled:opacity-60"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar contenido
      </button>
    </div>
  );
}
