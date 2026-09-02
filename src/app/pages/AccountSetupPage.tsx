import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import {
  activateAccountWithPassword,
  fetchAccountSetupPreview,
} from '../../lib/clientAccessApi';
import { persistUserSession } from '../../lib/authRouting';
import { PASSWORD_POLICY_HINT, validatePassword } from '../../lib/passwordPolicy';

export function AccountSetupPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState<{ email: string; clientName: string; alreadyActivated: boolean } | null>(
    null,
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchAccountSetupPreview(token);
        setPreview(data);
        if (data.alreadyActivated) setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Enlace inválido');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setSubmitting(true);
    try {
      const user = await activateAccountWithPassword(token, password);
      persistUserSession(user);
      setDone(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
          </div>
        ) : done && preview?.alreadyActivated ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Cuenta ya activada</h1>
            <p className="text-gray-600 mb-6">
              Tu acceso con {preview.email} ya está listo. Inicia sesión para entrar a tu panel.
            </p>
            <Link
              to="/"
              className="inline-block w-full py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold text-center"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : preview ? (
          <>
            <h1 className="text-2xl font-bold mb-2 text-center">Activa tu cuenta atoo</h1>
            <p className="text-gray-600 text-center mb-6">
              Hola {preview.clientName}, crea tu contraseña para acceder a tu vehículo.
            </p>

            <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 mb-6">
              <Mail className="w-5 h-5 text-[#1A1FE8]" />
              <div>
                <p className="text-xs text-gray-500">Tu correo registrado</p>
                <p className="font-medium text-gray-900">{preview.email}</p>
              </div>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full pl-10 pr-10 py-3 border rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">{PASSWORD_POLICY_HINT}</p>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold disabled:opacity-50"
              >
                {submitting ? 'Creando acceso…' : 'Crear contraseña e ingresar'}
              </button>
            </form>
          </>
        ) : (
          <p className="text-red-600 text-center">{error ?? 'Enlace inválido'}</p>
        )}
      </div>
    </div>
  );
}
