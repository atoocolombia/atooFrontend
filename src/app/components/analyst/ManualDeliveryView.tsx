import { useState } from 'react';
import { Loader2, PlusCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { createManualDelivery } from '../../../lib/deliveriesApi';

export function ManualDeliveryView() {
  const { theme } = useTheme();
  const [clientName, setClientName] = useState('');
  const [idDocumentNumber, setIdDocumentNumber] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/30 text-white'
      : 'bg-white border-gray-200 text-gray-900';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await createManualDelivery({
        clientName,
        idDocumentNumber,
        address: address || undefined,
        email,
        phone: phone || undefined,
        deliveryLocation: deliveryLocation || undefined,
      });
      setSuccess(`Entrega creada para ${created.clientName}. El asesor ya puede ver la card.`);
      setClientName('');
      setIdDocumentNumber('');
      setAddress('');
      setEmail('');
      setPhone('');
      setDeliveryLocation('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la entrega');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Alta manual de entrega
        </h1>
        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          Crea la card de entrega sin esperar una solicitud digital del cliente
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="grid sm:grid-cols-2 gap-4">
        {[
          ['Nombre', clientName, setClientName],
          ['Cédula', idDocumentNumber, setIdDocumentNumber],
          ['Dirección', address, setAddress],
          ['Correo', email, setEmail],
          ['Celular', phone, setPhone],
          ['Entrega (lugar / notas)', deliveryLocation, setDeliveryLocation],
        ].map(([label, value, setter]) => (
          <div key={String(label)} className={label === 'Dirección' || label === 'Entrega (lugar / notas)' ? 'sm:col-span-2' : ''}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              required={label === 'Nombre' || label === 'Cédula' || label === 'Correo'}
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              value={value as string}
              onChange={(e) => (setter as (v: string) => void)(e.target.value)}
            />
          </div>
        ))}

        {error && <p className="sm:col-span-2 text-red-500 text-sm">{error}</p>}
        {success && <p className="sm:col-span-2 text-emerald-600 text-sm">{success}</p>}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            Crear card de entrega
          </button>
        </div>
      </form>
    </div>
  );
}
