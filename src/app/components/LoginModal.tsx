import * as Dialog from '@radix-ui/react-dialog';
import { type CredentialResponse } from '@react-oauth/google';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { persistUserSession, resolvePostAuthPath, resolvePostAuthPathAsync } from '../../lib/authRouting';
import type { RegisteredUser } from '../../lib/api';
import { ApiError, authWithGoogle, loginUser } from '../../lib/api';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const finishLogin = async (user: RegisteredUser) => {
    persistUserSession(user);
    onClose();
    const path =
      user.userType === 'USER'
        ? await resolvePostAuthPathAsync(user)
        : resolvePostAuthPath(user);
    navigate(path);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError('');

    try {
      const user = await loginUser({ email, password });
      finishLogin(user);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo iniciar sesión. Inténtalo de nuevo.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setApiError('No se recibió respuesta de Google.');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const user = await authWithGoogle(response.credential);
      finishLogin(user);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo iniciar sesión con Google. Inténtalo de nuevo.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl w-full max-w-md p-8 z-50 animate-in fade-in zoom-in-95 transition-colors ${
          theme === 'dark'
            ? 'bg-[#0D0F2E] border border-blue-600/20'
            : 'bg-white'
        }`}>
          <Dialog.Close className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-white/10 text-gray-400'
              : 'hover:bg-gray-100 text-gray-500'
          }`}>
            <X className="w-5 h-5" />
          </Dialog.Close>

          <div className="mb-8">
            <Dialog.Title className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Iniciar Sesión
            </Dialog.Title>
            <Dialog.Description className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Ingresa a tu cuenta de <span className="text-[#1A1FE8] font-semibold">atoo</span> para continuar
            </Dialog.Description>
          </div>

          <div className="space-y-3 mb-6">
            {googleClientId ? (
              <GoogleSignInButton
                theme={theme}
                disabled={isSubmitting}
                onSuccess={handleGoogleSuccess}
                onError={() => setApiError('No se pudo iniciar sesión con Google.')}
              />
            ) : (
              <button
                type="button"
                disabled
                className={`w-full py-3 px-4 border-2 rounded-lg opacity-60 cursor-not-allowed flex items-center justify-center gap-3 ${
                  theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'
                }`}
              >
                <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Google (configura VITE_GOOGLE_CLIENT_ID)
                </span>
              </button>
            )}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${theme === 'dark' ? 'bg-[#0D0F2E] text-gray-400' : 'bg-white text-gray-500'}`}>O continúa con email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setApiError('');
                  }}
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-blue-600/20 text-white placeholder-gray-500 focus:border-[#1A1FE8] focus:ring-2 focus:ring-[#1A1FE8]/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setApiError('');
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-blue-600/20 text-white placeholder-gray-500 focus:border-[#1A1FE8] focus:ring-2 focus:ring-[#1A1FE8]/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <a href="#" className="text-sm text-[#1A1FE8] hover:text-[#1217C8]">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {apiError && (
              <p className="text-red-500 text-sm">{apiError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            ¿No tienes cuenta?{' '}
            <button 
              onClick={onSwitchToRegister}
              className="text-[#1A1FE8] hover:text-[#1217C8] font-semibold"
            >
              Regístrate gratis
            </button>
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
