import { FileText, Shield, Lock, Eye, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DataAuthorizationStepProps {
  onNext: () => void;
}

export function DataAuthorizationStep({ onNext }: DataAuthorizationStepProps) {
  const { theme } = useTheme();

  const handleSignioRequest = () => {
    // Aquí iría la integración con Signio
    console.log('Solicitando firma digital a Signio...');
    // Simulamos el envío exitoso
    alert('Se ha enviado el documento de autorización a tu correo electrónico para firma digital. Por favor revisa tu bandeja de entrada.');
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1FE8]/20 border-2 border-[#1A1FE8] mb-4 shadow-[0_0_20px_rgba(26,31,232,0.3)]">
          <Shield className="w-8 h-8 text-[#1A1FE8]" />
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Autorización de Tratamiento de Datos
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Protegemos tu información personal con los más altos estándares de seguridad
        </p>
      </div>

      {/* Información sobre el tratamiento de datos */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark'
          ? 'bg-[#06071A]/50 border-blue-600/20'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <Lock className="w-5 h-5 text-[#1A1FE8]" />
          ¿Cómo utilizaremos tus datos?
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Verificación de identidad
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Validaremos tu identidad mediante documentos oficiales para garantizar la seguridad del proceso
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Consulta de antecedentes
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Realizaremos consultas en bases de datos públicas (Policía, Procuraduría, SIMIT) para verificar tu historial
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Análisis crediticio
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Evaluaremos tu información bancaria para determinar tu capacidad de pago
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Comunicación del proceso
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Te mantendremos informado sobre el estado de tu solicitud vía WhatsApp y correo electrónico
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Administración del contrato
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Gestionaremos tu cuenta, pagos y el mantenimiento del vehículo durante la vigencia del contrato
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Derechos del titular */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark'
          ? 'bg-blue-600/10 border-blue-600/30'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
          theme === 'dark' ? 'text-blue-400' : 'text-blue-950'
        }`}>
          <Eye className="w-5 h-5" />
          Tus derechos como titular de los datos
        </h3>
        <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>
          <li>• Conocer, actualizar y rectificar tus datos personales</li>
          <li>• Solicitar prueba de la autorización otorgada</li>
          <li>• Revocar la autorización y/o solicitar la supresión del dato</li>
          <li>• Acceder de forma gratuita a tus datos personales</li>
          <li>• Presentar quejas ante la Superintendencia de Industria y Comercio</li>
        </ul>
      </div>

      {/* Información legal */}
      <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
        <p className="mb-2">
          Al continuar, autorizas a <strong className="text-[#1A1FE8]">atoo</strong> para recolectar, almacenar, usar, circular y suprimir tus datos personales de acuerdo con nuestra{' '}
          <a href="#" className="text-[#1A1FE8] hover:underline">
            Política de Privacidad
          </a>{' '}
          y en cumplimiento de la Ley 1581 de 2012 y sus decretos reglamentarios.
        </p>
        <p>
          La autorización será enviada a tu correo electrónico para firma digital mediante <strong>Signio</strong>.
        </p>
      </div>

      {/* Botón de firma digital */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleSignioRequest}
          className="group relative px-8 py-4 bg-[#1A1FE8] text-white rounded-lg overflow-hidden shadow-[0_0_20px_rgba(26,31,232,0.4)] hover:shadow-[0_0_30px_rgba(26,31,232,0.6)] transition-all"
        >
          <div className="relative z-10 flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div className="text-left">
              <div className="font-bold text-lg">Solicitar Firma Digital</div>
              <div className="text-sm text-blue-200">Enviar documento a mi correo</div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[#1217C8] opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>
    </div>
  );
}
