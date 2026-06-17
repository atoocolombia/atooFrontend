import * as Dialog from '@radix-ui/react-dialog';
import { type CredentialResponse } from '@react-oauth/google';
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { ApiError, authWithGoogle, registerUser } from '../../lib/api';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    passwordMatch: '',
    passwordStrength: '',
    api: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setErrors({ passwordMatch: 'Las contraseñas no coinciden', passwordStrength: '', api: '' });
      return;
    }

    // Validar fortaleza de contraseña
    if (formData.password.length < 8) {
      setErrors({ passwordMatch: '', passwordStrength: 'La contraseña debe tener al menos 8 caracteres', api: '' });
      return;
    }

    setIsSubmitting(true);
    setErrors({ passwordMatch: '', passwordStrength: '', api: '' });

    try {
      const user = await registerUser({
        email: formData.email,
        password: formData.password,
        userType: 'USER',
      });

      sessionStorage.setItem('atooUser', JSON.stringify(user));
      onClose();
      navigate('/solicitud');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo completar el registro. Inténtalo de nuevo.';
      setErrors({ passwordMatch: '', passwordStrength: '', api: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setErrors({ passwordMatch: '', passwordStrength: '', api: 'No se recibió respuesta de Google.' });
      return;
    }

    setIsSubmitting(true);
    setErrors({ passwordMatch: '', passwordStrength: '', api: '' });

    try {
      const user = await authWithGoogle(response.credential);
      sessionStorage.setItem('atooUser', JSON.stringify(user));
      onClose();
      navigate('/solicitud');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo registrar con Google. Inténtalo de nuevo.';
      setErrors({ passwordMatch: '', passwordStrength: '', api: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`Register with ${provider}`);
    // Aquí iría la lógica de registro social
    // Después del registro exitoso, redirigir a solicitud
    onClose();
    navigate('/solicitud');
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar errores cuando el usuario empieza a escribir
    setErrors({ passwordMatch: '', passwordStrength: '', api: '' });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl w-full max-w-md p-8 z-50 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto transition-colors ${
          theme === 'dark'
            ? 'bg-[#0D0F2E] border border-blue-600/20'
            : 'bg-white'
        }`}>
          {/* Close Button */}
          <Dialog.Close className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-white/10 text-gray-400'
              : 'hover:bg-gray-100 text-gray-500'
          }`}>
            <X className="w-5 h-5" />
          </Dialog.Close>

          {/* Header */}
          <div className="mb-8">
            <Dialog.Title className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Crear Cuenta
            </Dialog.Title>
            <Dialog.Description className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Únete a <span className="text-[#1A1FE8] font-semibold">atoo</span> y comienza tu camino hacia tu propio vehículo
            </Dialog.Description>
          </div>

          {/* Social Register Buttons */}
          <div className="space-y-3 mb-6">
            {googleClientId ? (
              <GoogleSignInButton
                theme={theme}
                disabled={isSubmitting}
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  setErrors({
                    passwordMatch: '',
                    passwordStrength: '',
                    api: 'No se pudo iniciar el registro con Google.',
                  })
                }
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

            <button
              onClick={() => handleSocialRegister('Facebook')}
              className={`w-full py-3 px-4 border-2 rounded-lg transition-colors flex items-center justify-center gap-3 group ${
                theme === 'dark'
                  ? 'border-blue-600/20 hover:border-blue-600/40 hover:bg-white/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Continuar con Facebook</span>
            </button>

            <button
              onClick={() => handleSocialRegister('Apple')}
              className={`w-full py-3 px-4 border-2 rounded-lg transition-colors flex items-center justify-center gap-3 group ${
                theme === 'dark'
                  ? 'border-blue-600/20 hover:border-blue-600/40 hover:bg-white/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill={theme === 'dark' ? '#FFFFFF' : '#000000'} viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Continuar con Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${theme === 'dark' ? 'bg-[#0D0F2E] text-gray-400' : 'bg-white text-gray-500'}`}>O regístrate con email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
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
              {errors.passwordStrength && (
                <p className="text-red-500 text-sm mt-1">{errors.passwordStrength}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirma tu contraseña"
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-white/5 border-blue-600/20 text-white placeholder-gray-500 focus:border-[#1A1FE8] focus:ring-2 focus:ring-[#1A1FE8]/20'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.passwordMatch && (
                <p className="text-red-500 text-sm mt-1">{errors.passwordMatch}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 w-4 h-4 text-[#1A1FE8] border-gray-300 rounded focus:ring-[#1A1FE8]"
                required
              />
              <label htmlFor="terms" className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Acepto los{' '}
                <a href="#" className="text-[#1A1FE8] hover:text-[#1217C8]">
                  Términos y Condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="text-[#1A1FE8] hover:text-[#1217C8]">
                  Política de Privacidad
                </a>
              </label>
            </div>

            {/* Submit Button */}
            {errors.api && (
              <p className="text-red-500 text-sm">{errors.api}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Login Link */}
          <p className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            ¿Ya tienes cuenta?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-[#1A1FE8] hover:text-[#1217C8] font-semibold"
            >
              Inicia sesión
            </button>
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}