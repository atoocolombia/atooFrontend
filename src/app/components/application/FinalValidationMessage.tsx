import { CheckCircle, MessageCircle, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTheme } from '../../contexts/ThemeContext';

export function FinalValidationMessage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 text-center py-12">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>

      <div>
        <h2 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          ¡Solicitud Completada!
        </h2>
        <p className={`text-xl mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Estamos validando toda tu información
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
              <Sparkles className="w-6 h-6 text-[#1A1FE8]" />
            </div>
            <div className="text-left">
              <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ¿Qué sigue ahora?
              </h3>
              <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <li>✅ Validación de identidad y documentos</li>
                <li>✅ Análisis de historial crediticio</li>
                <li>✅ Verificación de antecedentes</li>
                <li>✅ Revisión de información financiera</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-green-500/20 flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-left">
              <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Nos comunicaremos por WhatsApp
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Nuestro equipo está revisando cuidadosamente toda tu información. Te contactaremos cuando tu solicitud esté lista para continuar con los siguientes pasos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-blue-500/20 flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Tiempo de respuesta
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                El proceso de validación completo puede tomar entre 24 y 48 horas hábiles. Te mantendremos informado en cada etapa.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-2xl mx-auto p-6 rounded-xl border ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-blue-600/10 to-[#3D42F0]/10 border-blue-600/30'
          : 'bg-gradient-to-r from-[#F0F0FD] to-[#F0F0FD] border-blue-200'
      }`}>
        <h3 className={`font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          ¡Estás cada vez más cerca de tu vehículo!
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Gracias por confiar en <strong className="text-[#1A1FE8]">atoo</strong> para alcanzar tus metas.
          Estamos emocionados de ser parte de tu camino hacia la independencia financiera.
        </p>
      </div>

      <div className="pt-6 space-y-4">
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)]"
        >
          Volver al Inicio
        </button>

        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          Revisa tu WhatsApp periódicamente para estar al tanto de las actualizaciones
        </p>
      </div>
    </div>
  );
}
