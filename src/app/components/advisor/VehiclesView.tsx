import { Car, Battery, Gauge, Check, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function VehiclesView() {
  const { theme } = useTheme();

  const vehicles = [
    {
      id: 1,
      model: 'Nammi EV 2026',
      vin: 'LNBM2EV3XN1234567',
      status: 'available',
      battery: 100,
      mileage: 0,
      location: 'Sede Principal',
      color: 'Blanco Perla',
      features: ['Carga Rápida', 'Sistema de Navegación', 'Cámara 360°'],
    },
    {
      id: 2,
      model: 'Nammi EV 2026',
      vin: 'LNBM2EV3XN1234568',
      status: 'reserved',
      battery: 95,
      mileage: 50,
      location: 'Sede Norte',
      color: 'Negro Obsidiana',
      features: ['Carga Rápida', 'Asientos de Cuero', 'Techo Panorámico'],
      reservedFor: 'María González',
    },
    {
      id: 3,
      model: 'Nammi EV Plus 2026',
      vin: 'LNBM2EV3XN1234569',
      status: 'available',
      battery: 100,
      mileage: 0,
      location: 'Sede Principal',
      color: 'Azul Eléctrico',
      features: ['Carga Rápida', 'Autopilot', 'Sound System Premium'],
    },
    {
      id: 4,
      model: 'Nammi SUV 2026',
      vin: 'LNBM2EV3XN1234570',
      status: 'maintenance',
      battery: 80,
      mileage: 120,
      location: 'Taller Central',
      color: 'Gris Titanio',
      features: ['7 Pasajeros', 'Tracción AWD', 'Sistema de Seguridad Avanzado'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Disponible' };
      case 'reserved':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Reservado' };
      case 'maintenance':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Mantenimiento' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Desconocido' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Vehículos Disponibles</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Inventario de vehículos para el programa Rent to Own</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Disponibles</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {vehicles.filter((v) => v.status === 'available').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-yellow-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Reservados</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {vehicles.filter((v) => v.status === 'reserved').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-orange-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Mantenimiento</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {vehicles.filter((v) => v.status === 'maintenance').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicles.length}</p>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => {
          const statusStyle = getStatusColor(vehicle.status);
          return (
            <div
              key={vehicle.id}
              className={`${theme === 'dark' ? 'bg-[#0D0F2E] border-2 border-[#1A1FE8]/20 hover:border-[#1A1FE8]/40' : 'bg-white shadow-lg border-2 border-gray-100 hover:border-indigo-200'} rounded-2xl p-6 transition-colors`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicle.model}</h3>
                  <p className={`text-sm font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{vehicle.vin}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
                >
                  {statusStyle.label}
                </span>
              </div>

              {/* Vehicle Image Placeholder */}
              <div className="bg-gradient-to-br from-[#1A1FE8] to-[#3D42F0] rounded-xl h-40 flex items-center justify-center mb-4">
                <Car className="w-20 h-20 text-white opacity-50" />
              </div>

              {/* Vehicle Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Battery className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Batería</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicle.battery}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Gauge className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Kilometraje</p>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicle.mileage} km</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Ubicación</p>
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicle.location}</p>
                </div>

                <div className="col-span-2">
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Color</p>
                  <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicle.color}</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Características</p>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((feature, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 rounded text-xs font-medium ${theme === 'dark' ? 'bg-[#1A1FE8]/20 text-[#1A1FE8]' : 'bg-[#E8E9FD] text-[#1A1FE8]'}`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reserved Info */}
              {vehicle.status === 'reserved' && vehicle.reservedFor && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Reservado para:</strong> {vehicle.reservedFor}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {vehicle.status === 'available' && (
                  <button className="flex-1 px-4 py-2 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold text-sm">
                    Asignar a Cliente
                  </button>
                )}
                <button className={`flex-1 px-4 py-2 border-2 rounded-lg transition-colors font-semibold text-sm ${theme === 'dark' ? 'border-[#1A1FE8]/30 text-gray-300 hover:bg-[#141638]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  Ver Detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
