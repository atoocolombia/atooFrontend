import { useCallback, useEffect, useState } from 'react';
import { Loader2, MapPin, Plus, Wrench, Mail, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ApiError } from '../../../lib/api';
import {
  adminCreateWorkshop,
  adminFetchWorkshops,
  adminUpdateWorkshop,
  type AdminWorkshop,
} from '../../../lib/workshopsAdminApi';

export function WorkshopsAdminView() {
  const { theme } = useTheme();
  const [workshops, setWorkshops] = useState<AdminWorkshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('12345');
  const [phone, setPhone] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setWorkshops(await adminFetchWorkshops());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar los talleres');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await adminCreateWorkshop({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        email: email.trim(),
        password: password.trim() || '12345',
        phone: phone.trim() || undefined,
      });
      setSuccess(
        `Taller creado. Acceso: ${created.loginEmail} / ${created.initialPassword} → ${created.portalPath}`,
      );
      setName('');
      setAddress('');
      setCity('');
      setEmail('');
      setPassword('12345');
      setPhone('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el taller');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (workshop: AdminWorkshop) => {
    try {
      await adminUpdateWorkshop(workshop.id, { active: !workshop.active });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar el taller');
    }
  };

  const cardClass = `rounded-2xl border p-6 ${
    theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20' : 'bg-white border-gray-200 shadow-sm'
  }`;

  const inputClass = `w-full rounded-xl border px-4 py-3 ${
    theme === 'dark' ? 'bg-white/5 border-blue-600/30 text-white' : 'bg-white border-gray-200'
  }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Talleres asociados
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Crea talleres con dirección y correo de acceso para el panel en /taller
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          {success}
        </p>
      )}

      <form onSubmit={handleCreate} className={cardClass}>
        <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <Plus className="w-5 h-5 text-[#1A1FE8]" />
          Nuevo taller
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre del taller</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ciudad</label>
            <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Dirección</label>
            <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Correo de acceso</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="taller.ciudad@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña inicial</label>
            <input
              type="text"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Teléfono (opcional)</label>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 px-6 py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold hover:bg-[#1217C8] disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />}
          Crear taller y usuario de acceso
        </button>
      </form>

      <div className={cardClass}>
        <h2 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Talleres registrados
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
          </div>
        ) : workshops.length === 0 ? (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No hay talleres registrados.</p>
        ) : (
          <div className="space-y-3">
            {workshops.map((w) => (
              <div
                key={w.id}
                className={`rounded-xl border p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 ${
                  theme === 'dark' ? 'border-blue-600/20 bg-white/5' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {w.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        w.active ? 'bg-green-500/15 text-green-600' : 'bg-gray-500/15 text-gray-500'
                      }`}
                    >
                      {w.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <MapPin className="w-3.5 h-3.5" />
                    {w.address}, {w.city}
                  </p>
                  {w.loginEmail && (
                    <p className={`text-sm mt-1 flex items-center gap-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Mail className="w-3.5 h-3.5" />
                      {w.loginEmail}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(w)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                    w.active
                      ? 'border-red-500/30 text-red-600 hover:bg-red-500/10'
                      : 'border-green-500/30 text-green-600 hover:bg-green-500/10'
                  }`}
                >
                  {w.active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
