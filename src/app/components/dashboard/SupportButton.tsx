import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function SupportButton() {
  const [isHovered, setIsHovered] = useState(false);

  const whatsappNumber = '573001234567'; // Número de WhatsApp de soporte
  const defaultMessage = '¡Hola! Necesito ayuda con mi vehículo DriveOwn.';

  const handleSupportClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={handleSupportClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
      >
        {/* Expandable container */}
        <div className={`flex items-center transition-all duration-300 ${
          isHovered ? 'pr-6 pl-5 py-4' : 'p-5'
        }`}>
          <MessageCircle className={`w-7 h-7 transition-transform duration-300 ${
            isHovered ? 'rotate-12 scale-110' : ''
          }`} />

          {/* Text that appears on hover */}
          <span className={`whitespace-nowrap font-bold text-lg transition-all duration-300 overflow-hidden ${
            isHovered ? 'max-w-xs ml-3 opacity-100' : 'max-w-0 ml-0 opacity-0'
          }`}>
            Soporte WhatsApp
          </span>
        </div>

        {/* Animated pulse ring */}
        <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20" />

        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
          !
        </span>
      </button>

      {/* Tooltip */}
      {!isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          ¿Necesitas ayuda? Chatea con nosotros
          <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
