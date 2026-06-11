import { useState } from 'react';
import { Mail, Phone, MapPin, Globe, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface PersonalInfoStepProps {
  onSubmit: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

export function PersonalInfoStep({ onSubmit, onBack, initialData }: PersonalInfoStepProps) {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    citizenshipType: initialData.citizenshipType || '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Confirmación de Datos Personales
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Verifica y confirma tu información extraída de los documentos
        </p>
      </div>

      <div className="space-y-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Nombre(s) *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Juan Carlos"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-white/5 border-blue-600/20 text-white placeholder-gray-500 focus:border-[#1A1FE8] focus:ring-2 focus:ring-[#1A1FE8]/20'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent'
              }`}
              required
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Apellido(s) *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Pérez García"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-white/5 border-blue-600/20 text-white placeholder-gray-500 focus:border-[#1A1FE8] focus:ring-2 focus:ring-[#1A1FE8]/20'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent'
              }`}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Correo Electrónico *
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

        {/* Phone */}
        <div>
          <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Teléfono *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+57 300 123 4567"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all ${
                theme === 'dark'
                  ? 'bg-white/5 border-blue-600/20 text-white placeholder-gray-500 focus:border-[#1A1FE8] focus:ring-2 focus:ring-[#1A1FE8]/20'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent'
              }`}
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Dirección *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-4 w-5 h-5 text-gray-400" />
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Calle, número, colonia, ciudad, estado, código postal"
              rows={3}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all resize-none ${
                theme === 'dark'
                  ? 'bg-white/5 border-blue-600/20 text-white placeholder-gray-500 focus:border-[#1A1FE8] focus:ring-2 focus:ring-[#1A1FE8]/20'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent'
              }`}
              required
            />
          </div>
        </div>

        {/* Citizenship Type */}
        <div>
          <label htmlFor="citizenshipType" className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Tipo de Ciudadanía *
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <select
              id="citizenshipType"
              value={formData.citizenshipType}
              onChange={(e) => handleChange('citizenshipType', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all appearance-none ${
                theme === 'dark'
                  ? 'bg-white/5 border-blue-600/20 text-white focus:border-[#1A1FE8] focus:ring-2 focus:ring-[#1A1FE8]/20'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent'
              }`}
              required
            >
              <option value="">Selecciona una opción</option>
              <option value="nacional">Nacional</option>
              <option value="extranjero">Extranjero con Cédula de Extranjería</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="ppt-venezolano">PPT Venezolano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className={`border rounded-lg p-4 ${
        theme === 'dark'
          ? 'bg-blue-600/10 border-blue-600/30'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
          📋 Información importante
        </h4>
        <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
          Estos datos han sido extraídos de los documentos que subiste anteriormente.
          Verifica que toda la información sea correcta antes de continuar. Si hay algún
          error, puedes corregirlo ahora.
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className={`border-2 rounded-lg p-5 ${
        theme === 'dark'
          ? 'bg-white/5 border-blue-600/30'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-start gap-3">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 w-5 h-5 text-[#1A1FE8] border-gray-300 rounded focus:ring-[#1A1FE8] cursor-pointer"
            required
          />
          <label htmlFor="terms" className={`text-sm cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Al enviar esta solicitud, acepto el{' '}
            <a href="#" className="text-[#1A1FE8] hover:text-[#1217C8] font-semibold underline">
              uso y tratamiento de datos personales
            </a>{' '}
            de acuerdo con las políticas de privacidad de atoo. Confirmo que toda la
            información proporcionada es veraz y puede ser verificada.
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className={`px-8 py-3 border rounded-lg transition-colors font-semibold ${
            theme === 'dark'
              ? 'border-blue-600/30 text-gray-300 hover:bg-white/5'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Atrás
        </button>
        <button
          type="submit"
          disabled={!acceptTerms}
          className={`px-8 py-3 rounded-lg transition-colors font-semibold ${
            acceptTerms
              ? 'bg-[#1A1FE8] text-white hover:bg-[#1217C8] shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)]'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Enviar Solicitud
        </button>
      </div>
    </form>
  );
}