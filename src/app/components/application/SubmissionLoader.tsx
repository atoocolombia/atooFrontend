import { useState, useEffect } from 'react';
import { Loader2, Battery, Droplet, Zap, Thermometer, Shield } from 'lucide-react';

const tips = [
  {
    icon: Battery,
    text: "Carga tu vehículo eléctrico cuando la batería esté entre 20% y 80% para maximizar su vida útil.",
  },
  {
    icon: Zap,
    text: "Evita las cargas rápidas frecuentes. Usa carga lenta nocturna siempre que sea posible.",
  },
  {
    icon: Thermometer,
    text: "No expongas el vehículo a temperaturas extremas por períodos prolongados. Afecta la batería.",
  },
  {
    icon: Droplet,
    text: "Mantén las llantas con la presión correcta para optimizar el consumo de energía.",
  },
  {
    icon: Shield,
    text: "Realiza el mantenimiento preventivo cada 10,000 km. Los autos eléctricos requieren menos, pero es importante.",
  },
  {
    icon: Battery,
    text: "La regeneración de frenado ayuda a recuperar energía. Úsala en tráfico urbano.",
  },
  {
    icon: Zap,
    text: "Precalienta o enfría el vehículo mientras está conectado a la corriente para ahorrar batería.",
  },
  {
    icon: Thermometer,
    text: "En climas fríos, la autonomía puede reducirse hasta un 30%. Planifica tus rutas.",
  },
];

export function SubmissionLoader() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000); // Cambia cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = tips[currentTipIndex].icon;

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="relative inline-block">
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full" />
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Procesando tu solicitud...
      </h3>

      <p className="text-gray-600 mb-8">
        Mientras esperas, aprende sobre el cuidado de tu futuro vehículo eléctrico
      </p>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 max-w-2xl mx-auto border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <CurrentIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="font-semibold text-blue-900 mb-2">
              💡 Consejo {currentTipIndex + 1} de {tips.length}
            </h4>
            <p className="text-gray-700 leading-relaxed">
              {tips[currentTipIndex].text}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {tips.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentTipIndex
                ? 'w-8 bg-blue-600'
                : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
