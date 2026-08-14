import { useEffect, useState } from 'react';
import { Loader2, Lock, Save, UserRound } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { changeAuthPassword, updateAuthProfile } from '../../../lib/authApi';
import type { UserProfile } from '../../../lib/userProfileApi';

interface ProfileSettingsViewProps {
  profile: UserProfile | null;
  profileLoading: boolean;
  userEmail: string;
  onProfileUpdated: () => void;
}

export function ProfileSettingsView({
  profile,
  profileLoading,
  userEmail,
  onProfileUpdated,
}: ProfileSettingsViewProps) {
  const { theme } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(profile?.firstName ?? '');
    setLastName(profile?.lastName ?? '');
    setPhone(profile?.phone ?? '');
    setAddress(profile?.address ?? '');
  }, [profile]);

  const cardClass =
    theme === 'dark'
      ? 'bg-[#0D0F2E]/50 backdrop-blur-xl border-blue-600/20'
      : 'bg-white border-gray-200';
  const inputClass =
    theme === 'dark'
      ? 'bg-white/5 border-blue-600/30 text-white'
      : 'bg-white border-gray-200 text-gray-900';

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    setProfileMsg(null);
    try {
      await updateAuthProfile({
        firstName,
        lastName,
        phone,
        address,
      });
      setProfileMsg('Perfil actualizado correctamente.');
      onProfileUpdated();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'No se pudo guardar el perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordMsg(null);
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      setSavingPassword(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmación no coincide');
      setSavingPassword(false);
      return;
    }
    try {
      await changeAuthPassword({ currentPassword, newPassword });
      setPasswordMsg('Contraseña actualizada.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${cardClass}`}>
        <div className="flex items-center gap-3 mb-6">
          <UserRound className="w-6 h-6 text-[#1A1FE8]" />
          <div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Configuración
            </h2>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Edita tus datos personales
            </p>
          </div>
        </div>

        {profileLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Cargando perfil…
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Correo</label>
              <input
                value={userEmail}
                disabled
                className={`w-full rounded-xl border px-4 py-3 opacity-70 ${inputClass}`}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombres</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Apellidos</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
              />
            </div>
            {profile?.idDocumentNumber && (
              <p className="text-sm text-gray-500">
                Documento: <strong>{profile.idDocumentNumber}</strong> (solo lectura)
              </p>
            )}
            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            {profileMsg && <p className="text-sm text-emerald-600">{profileMsg}</p>}
            <button
              type="button"
              disabled={savingProfile}
              onClick={() => void saveProfile()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1FE8] text-white font-semibold hover:bg-[#1217C8] disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar cambios
            </button>
          </div>
        )}
      </div>

      <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${cardClass}`}>
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-[#1A1FE8]" />
          <div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Cambiar contraseña
            </h3>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Usa tu contraseña actual para definir una nueva
            </p>
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 ${inputClass}`}
            />
          </div>
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordMsg && <p className="text-sm text-emerald-600">{passwordMsg}</p>}
          <button
            type="button"
            disabled={savingPassword || !currentPassword || !newPassword}
            onClick={() => void savePassword()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1A1FE8]/40 text-[#1A1FE8] font-semibold hover:bg-[#1A1FE8]/5 disabled:opacity-50"
          >
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Actualizar contraseña
          </button>
        </div>
      </div>
    </div>
  );
}
