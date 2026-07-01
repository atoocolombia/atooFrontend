import { useState } from 'react';
import { Check, ArrowRight, Zap, Info } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { VehicleDetailModal } from './VehicleDetailModal';
import { useTheme } from '../contexts/ThemeContext';
import { landingLightSurfaces, landingLightType } from '../styles/landingSurfaces';
import { LandingEyebrow } from './landing/LandingEyebrow';
import { useLandingVehicles } from '../../lib/useLandingVehicles';
import { formatCop, type CatalogVehicle } from '../data/vehicles';

export function VehiclesSection() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { vehicles } = useLandingVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<CatalogVehicle | null>(null);

  return (
    <section id="vehiculos" className={`relative py-28 overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#06071A]' : landingLightSurfaces.vehicles
    }`}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme === 'dark' && (
          <>
            <div className="absolute top-1/2 -translate-y-1/2 -left-40 w-[700px] h-[700px] rounded-full blur-[220px] bg-[#1A1FE8]/18" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[180px] bg-[#3D42F0]/12" />
          </>
        )}
      </div>

      {theme === 'dark' && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A1FE8]/40 to-transparent" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          {theme === 'light' ? (
            <LandingEyebrow>Nuestra Flota</LandingEyebrow>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium mb-5 bg-[#1A1FE8]/15 border-[#1A1FE8]/30 text-blue-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1FE8] animate-pulse" />
              Nuestra Flota
            </div>
          )}
          <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            <span className={theme === 'dark' ? 'text-white' : landingLightType.titleOnWhite}>Vehículos </span>
            <span style={{ color: '#1A1FE8', textShadow: theme === 'dark' ? '0 0 40px rgba(26,31,232,0.5)' : 'none' }}>Disponibles</span>
          </h2>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : landingLightType.bodyOnWhite}`}>
            Dongfeng eléctricos, ideales para plataformas de transporte
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="group relative">
              {vehicle.popular && (
                <div className="absolute inset-0 bg-[#1A1FE8]/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}

              <div className={`relative overflow-hidden transition-all duration-300 border ${
                theme === 'dark'
                  ? `rounded-3xl ${
                      vehicle.popular
                        ? 'bg-white/[0.05] border-[#1A1FE8]/40 shadow-[0_0_40px_rgba(26,31,232,0.15)] hover:shadow-[0_0_60px_rgba(26,31,232,0.25)] hover:border-[#1A1FE8]/60'
                        : 'bg-white/[0.03] border-white/[0.07] hover:border-[#1A1FE8]/30 hover:shadow-[0_0_40px_rgba(26,31,232,0.15)]'
                    }`
                  : vehicle.popular
                    ? 'bg-white border-[#1A1FE8] shadow-[0_8px_30px_rgba(26,31,232,0.12)] hover:shadow-[0_12px_40px_rgba(26,31,232,0.18)]'
                    : 'bg-white border-gray-200/90 shadow-[0_1px_0_rgba(26,31,232,0.06)] hover:border-[#1A1FE8]/40 hover:shadow-[0_12px_40px_rgba(26,31,232,0.08)]'
              }`}>

                {vehicle.badge && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#1A1FE8] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-[0_0_20px_rgba(26,31,232,0.6)]">
                    <Zap className="w-3 h-3 fill-current" />
                    {vehicle.badge}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="w-full aspect-[16/9] overflow-hidden relative block text-left"
                  aria-label={`Ver detalles de ${vehicle.name}`}
                >
                  <ImageWithFallback
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    theme === 'dark' ? 'from-[#0D0F2E]/80 to-transparent' : 'from-black/20 to-transparent'
                  }`} />
                  <span className={`absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm ${
                    theme === 'dark' ? 'bg-black/40 text-white' : 'bg-white/90 text-gray-800'
                  }`}>
                    <Info className="w-3.5 h-3.5" />
                    Ver detalles
                  </span>
                </button>

                <div className="p-6">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                    theme === 'dark' ? 'text-[#6B70F5]' : 'text-[#1A1FE8]'
                  }`}>
                    {vehicle.type === 'camioneta' ? 'Camioneta SUV' : 'Carro compacto'}
                  </p>
                  <h3 className={`text-2xl font-bold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {vehicle.name}
                  </h3>
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {vehicle.subtitle}
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {vehicle.features.map((feature) => (
                      <li key={feature} className={`flex items-center gap-3 text-sm ${
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
                      <span className="text-2xl font-bold text-[#1A1FE8]">{formatCop(vehicle.weeklyPriceCop)}</span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>COP / semana</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          theme === 'dark'
                            ? 'border border-[#1A1FE8]/30 text-[#6B70F5] hover:bg-[#1A1FE8]/10 hover:border-[#1A1FE8]/50'
                            : 'border border-[#1A1FE8]/25 text-[#1A1FE8] hover:bg-[#1A1FE8]/8 hover:border-[#1A1FE8]/45'
                        }`}
                      >
                        <Info className="w-4 h-4" />
                        Ver ficha técnica
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/solicitud')}
                        className={`group/btn relative flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${
                          vehicle.popular
                            ? 'bg-[#1A1FE8] text-white shadow-[0_0_25px_rgba(26,31,232,0.4)] hover:shadow-[0_0_40px_rgba(26,31,232,0.6)]'
                            : theme === 'dark'
                              ? 'border border-[#1A1FE8]/30 text-[#6B70F5] hover:bg-[#1A1FE8]/10'
                              : 'border border-[#1A1FE8]/25 text-[#1A1FE8] hover:bg-[#1A1FE8]/8'
                        }`}
                      >
                        <span className="relative z-10">Solicitar</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform relative z-10" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <VehicleDetailModal
        vehicle={selectedVehicle}
        open={selectedVehicle !== null}
        onClose={() => setSelectedVehicle(null)}
      />

      {theme === 'dark' && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A1FE8]/40 to-transparent" />
      )}
    </section>
  );
}
