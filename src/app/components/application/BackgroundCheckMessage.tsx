import { Shield, MessageCircle, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface BackgroundCheckMessageProps {
  onContinue: () => void;
}

export function BackgroundCheckMessage({ onContinue }: BackgroundCheckMessageProps) {
  const { theme } = useTheme();

  // Simulamos un delay de 3 segundos antes de permitir continuar
  setTimeout(() => {
    // El componente mostrará el mensaje inmediatamente
  }, 0);

  return (
    <div className="space-y-8 text-center py-12">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#1A1FE8]/20 border-2 border-[#1A1FE8] mb-4 shadow-[0_0_30px_rgba(26,31,232,0.3)] animate-pulse">
        <Shield className="w-12 h-12 text-[#1A1FE8]" />
      </div>

      <div>
        <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          ¡Documentos Recibidos!
        </h2>
        <p className={`text-xl mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Estamos validando tus antecedentes
        </p>
      </div>

      <div className={`max-w-2xl mx-auto rounded-xl border p-8 ${
        theme === 'dark'
          ? 'bg-[#06071A]/50 border-blue-600/20'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-blue-600/20 flex-shrink-0">
              <Clock className="w-6 h-6 text-[#1A1FE8]" />
            </div>
            <div className="text-left">
              <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ¿Qué estamos verificando?
              </h3>
              <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>• Antecedentes judiciales</li>
                <li>• Antecedentes en Procuraduría</li>
                <li>• Multas y comparendos de tránsito (SIMIT)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-green-500/20 flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-left">
              <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Te contactaremos por WhatsApp
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Nuestro equipo de analistas está revisando tu información. Te notificaremos el resultado de la verificación en las próximas horas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-xl mx-auto p-6 rounded-xl border ${
        theme === 'dark'
          ? 'bg-blue-600/10 border-blue-600/30'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>
          ⏱️ <strong>Tiempo estimado:</strong> Este proceso puede tomar entre 2 y 24 horas. Te mantendremos informado en cada paso.
        </p>
      </div>

      <div className="pt-6">
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)]"
        >
          Continuar con la Solicitud
        </button>
      </div>

      <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
        Mientras esperamos los resultados, puedes continuar completando tu información
      </p>
    </div>
  );
}
