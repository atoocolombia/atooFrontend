import { CheckCircle, FileText, Car, CreditCard, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';

export function ConfirmationSuccess() {
  const navigate = useNavigate();

  const nextSteps = [
    {
      icon: FileText,
      title: 'Preparación del Contrato',
      description: 'Nuestro equipo legal está elaborando tu contrato personalizado Rent to Own',
      status: 'En proceso',
      color: 'blue',
    },
    {
      icon: Car,
      title: 'Alistamiento del Vehículo',
      description: 'Estamos preparando tu Nammi EV con inspección completa y carga total',
      status: 'En proceso',
      color: 'green',
    },
    {
      icon: CreditCard,
      title: 'Depósito Inicial',
      description: 'Pronto recibirás las instrucciones para realizar tu depósito inicial',
      status: 'Próximamente',
      color: 'blue',
    },
  ];

  return (
    <div className="text-center py-8">
      {/* Success Animation */}
      <div className="mb-8">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          ¡Registro Exitoso!
        </h1>
        <p className="text-xl text-gray-600">
          Tu solicitud ha sido recibida correctamente
        </p>
      </div>

      {/* Information Message */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 max-w-2xl mx-auto mb-8">
        <div className="flex items-start gap-4 text-left">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-blue-900 mb-3">
              Tómate un tiempo, estamos trabajando para ti
            </h3>
            <p className="text-blue-800 leading-relaxed mb-4">
              Nuestro equipo está procesando tu registro y preparando todo para la entrega
              de tu vehículo. Este proceso puede tomar algunos días mientras verificamos
              tu información y alistamos tu Nammi EV.
            </p>
            <p className="text-blue-800 font-semibold">
              📱 Te mantendremos informado por WhatsApp en cada paso del proceso.
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Próximos Pasos del Proceso
        </h2>

        <div className="space-y-4">
          {nextSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      step.color === 'blue'
                        ? 'bg-blue-100'
                        : step.color === 'green'
                        ? 'bg-green-100'
                        : 'bg-blue-100'
                    }`}
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        step.color === 'blue'
                          ? 'text-blue-600'
                          : step.color === 'green'
                          ? 'text-green-600'
                          : 'text-blue-700'
                      }`}
                    />
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {index + 1}. {step.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          step.status === 'En proceso'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {step.status}
                      </span>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Estimate */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto mb-8">
        <h3 className="font-semibold text-gray-900 mb-3">
          ⏱️ Tiempo Estimado del Proceso
        </h3>
        <p className="text-gray-700">
          El proceso completo de verificación y preparación toma aproximadamente{' '}
          <span className="font-bold text-blue-600">5 a 7 días hábiles</span>.
        </p>
      </div>

      {/* Contact Information */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-2xl mx-auto mb-8">
        <h3 className="font-semibold text-green-900 mb-2">
          💬 ¿Tienes preguntas?
        </h3>
        <p className="text-green-800 mb-3">
          Nuestro equipo de soporte está disponible para ayudarte en cualquier momento.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/573001234567?text=Hola,%20acabo%20de%20completar%20mi%20registro"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold inline-flex items-center justify-center gap-2"
          >
            <span>📱</span>
            Contactar por WhatsApp
          </a>
          <a
            href="mailto:soporte@driveown.com"
            className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold inline-flex items-center justify-center gap-2"
          >
            <span>✉️</span>
            Enviar Email
          </a>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => navigate('/')}
        className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
      >
        Volver al Inicio
      </button>

      {/* Footer Note */}
      <p className="text-sm text-gray-500 mt-6 max-w-lg mx-auto">
        Recibirás un mensaje de WhatsApp con el número de tu solicitud y los detalles
        del proceso. Mantén tu teléfono activo para recibir las actualizaciones.
      </p>
    </div>
  );
}
