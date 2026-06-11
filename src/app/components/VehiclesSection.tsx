import { Check, ArrowRight, Zap } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme } from '../contexts/ThemeContext';

const vehicles = [
  {
    name: 'Carro NAMMI',
    image: 'https://images.unsplash.com/photo-1611953070713-6e5fb4b97b66?w=800&fit=crop&auto=format',
    features: ['Aire acondicionado', 'Bluetooth', 'Cámara reversa', '4 puertas', 'Bajo consumo'],
    badge: 'Más Popular',
    popular: true,
  },
  {
    name: 'Camioneta',
    image: 'https://images.unsplash.com/photo-1649793395985-967862a3b73f?w=800&fit=crop&auto=format',
    features: ['Amplio espacio de carga', 'Tracción 4x4', 'Ideal para mudanzas', 'Mayor capacidad', 'Resistente'],
    badge: null,
    popular: false,
  },
];

export function VehiclesSection() {
  const { theme } = useTheme();

  return (
    <section id="vehiculos" className={`relative py-28 overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#06071A]' : 'bg-white'
    }`}>

      {/* Aurora */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme === 'dark' ? (
          <>
            <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-[700px] h-[700px] rounded-full blur-[220px] bg-[#1A1FE8]/18" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[180px] bg-[#3D42F0]/12" />
          </>
        ) : (
          <>
            <div className="absolute top-1/2 -translate-y-1/2 -right-20 w-[600px] h-[600px] rounded-full blur-[200px] bg-[#1A1FE8]/9" />
            <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full blur-[160px] bg-[#1A1FE8]/6" />
          </>
        )}
      </div>

      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A1FE8]/40 to-transparent`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium mb-5 ${
            theme === 'dark'
              ? 'bg-[#1A1FE8]/15 border-[#1A1FE8]/30 text-blue-300'
              : 'bg-[#1A1FE8]/8 border-[#1A1FE8]/20 text-[#1A1FE8]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1FE8] animate-pulse" />
            Nuestra Flota
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Vehículos </span>
            <span style={{ color: '#1A1FE8', textShadow: theme === 'dark' ? '0 0 40px rgba(26,31,232,0.5)' : 'none' }}>Disponibles</span>
          </h2>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Modelos recientes, ideales para plataformas de transporte
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {vehicles.map((vehicle, index) => (
            <div key={index} className="group relative">
              {/* Glow */}
              {vehicle.popular && (
                <div className="absolute inset-0 bg-[#1A1FE8]/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}

              <div className={`relative rounded-3xl overflow-hidden transition-all duration-300 border ${
                theme === 'dark'
                  ? vehicle.popular
                    ? 'bg-white/[0.05] border-[#1A1FE8]/40 shadow-[0_0_40px_rgba(26,31,232,0.15)] hover:shadow-[0_0_60px_rgba(26,31,232,0.25)] hover:border-[#1A1FE8]/60'
                    : 'bg-white/[0.03] border-white/[0.07] hover:border-[#1A1FE8]/30 hover:shadow-[0_0_40px_rgba(26,31,232,0.15)]'
                  : vehicle.popular
                    ? 'bg-white border-[#1A1FE8]/30 shadow-[0_4px_40px_rgba(26,31,232,0.12)] hover:shadow-[0_8px_60px_rgba(26,31,232,0.20)] hover:border-[#1A1FE8]/50'
                    : 'bg-white border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.07)] hover:border-[#1A1FE8]/25 hover:shadow-[0_8px_40px_rgba(26,31,232,0.10)]'
              }`}>

                {vehicle.badge && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#1A1FE8] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-[0_0_20px_rgba(26,31,232,0.6)]">
                    <Zap className="w-3 h-3 fill-current" />
                    {vehicle.badge}
                  </div>
                )}

                {/* Image */}
                <div className="aspect-[16/9] overflow-hidden relative">
                  <ImageWithFallback
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    theme === 'dark' ? 'from-[#0D0F2E]/80 to-transparent' : 'from-black/20 to-transparent'
                  }`} />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className={`text-2xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {vehicle.name}
                  </h3>

                  <ul className="space-y-2.5 mb-6">
                    {vehicle.features.map((feature, idx) => (
                      <li key={idx} className={`flex items-center gap-3 text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <div className="w-5 h-5 rounded-full bg-[#1A1FE8]/15 border border-[#1A1FE8]/30 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-[#1A1FE8]" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className={`pt-4 border-t ${
                    theme === 'dark' ? 'border-white/[0.07]' : 'border-gray-100'
                  }`}>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-[#1A1FE8]">$207.000</span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>COP / semana</span>
                    </div>
                    <button className={`group/btn relative w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${
                      vehicle.popular
                        ? 'bg-[#1A1FE8] text-white shadow-[0_0_25px_rgba(26,31,232,0.4)] hover:shadow-[0_0_40px_rgba(26,31,232,0.6)]'
                        : theme === 'dark'
                          ? 'border border-[#1A1FE8]/30 text-[#6B70F5] hover:bg-[#1A1FE8]/10 hover:border-[#1A1FE8]/50'
                          : 'border border-[#1A1FE8]/25 text-[#1A1FE8] hover:bg-[#1A1FE8]/8 hover:border-[#1A1FE8]/45'
                    }`}>
                      <span className="relative z-10">Solicitar Este Vehículo</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform relative z-10" />
                      {vehicle.popular && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1A1FE8] to-[#3D42F0] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A1FE8]/40 to-transparent`} />
    </section>
  );
}
