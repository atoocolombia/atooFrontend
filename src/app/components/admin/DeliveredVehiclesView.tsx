import { Car, User, Calendar, DollarSign, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface Vehicle {
  id: number;
  vin: string;
  model: string;
  client: string;
  deliveryDate: string;
  weeklyPayment: number;
  weeksPaid: number;
  totalWeeks: number;
  totalPaid: number;
  totalValue: number;
  lastPaymentDate: string;
  paymentStatus: 'current' | 'late';
  ownership: number;
}

export function DeliveredVehiclesView() {
  const { theme } = useTheme();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const vehicles: Vehicle[] = [
    {
      id: 1,
      vin: 'LNBM2EV3XN1234567',
      model: 'Nammi EV 2026',
      client: 'Juan Pérez',
      deliveryDate: '2026-01-15',
      weeklyPayment: 207000,
      weeksPaid: 130,
      totalWeeks: 260,
      totalPaid: 15000000,
      totalValue: 25000000,
      lastPaymentDate: '2026-06-01',
      paymentStatus: 'current',
      ownership: 60,
    },
    {
      id: 2,
      vin: 'LNBM2EV3XN1234568',
      model: 'Nammi EV 2026',
      client: 'María González',
      deliveryDate: '2025-11-20',
      weeklyPayment: 207000,
      weeksPaid: 152,
      totalWeeks: 260,
      totalPaid: 17500000,
      totalValue: 25000000,
      lastPaymentDate: '2026-05-25',
      paymentStatus: 'current',
      ownership: 70,
    },
    {
      id: 3,
      vin: 'LNBM2EV3XN1234569',
      model: 'Nammi EV Plus 2026',
      client: 'Carlos Rodríguez',
      deliveryDate: '2026-02-10',
      weeklyPayment: 253000,
      weeksPaid: 108,
      totalWeeks: 260,
      totalPaid: 13750000,
      totalValue: 30000000,
      lastPaymentDate: '2026-05-18',
      paymentStatus: 'late',
      ownership: 46,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Vehículos Entregados</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Vista detallada de todos los vehículos en circulación
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Entregados</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicles.length}</p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Valor Total</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(vehicles.reduce((sum, v) => sum + v.totalValue, 0))}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-700" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Recaudado</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(vehicles.reduce((sum, v) => sum + v.totalPaid, 0))}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Este Mes</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>12</p>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => setSelectedVehicle(vehicle)}
            className={`${theme === 'dark' ? 'bg-[#0D0F2E] border-2 border-[#1A1FE8]/20 hover:border-red-400/40' : 'bg-white shadow-lg border-2 border-gray-100 hover:border-red-300'} rounded-2xl p-6 transition-all cursor-pointer group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold transition-colors group-hover:text-red-600 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {vehicle.model}
                </h3>
                <p className={`text-sm font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{vehicle.vin}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  vehicle.paymentStatus === 'current'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {vehicle.paymentStatus === 'current' ? 'Al día' : 'Atrasado'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Progreso de Propiedad</span>
                <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicle.ownership}%</span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-100'}`}>
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                  style={{ width: `${vehicle.ownership}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Cliente:</span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicle.client}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Semanas pagadas:</span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {vehicle.weeksPaid}/{vehicle.totalWeeks}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Pagado:</span>
                <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(vehicle.totalPaid)}
                </span>
              </div>
            </div>

            <button className={`w-full mt-4 py-2 rounded-lg transition-colors font-semibold text-sm ${theme === 'dark' ? 'bg-[#141638] text-white hover:bg-red-600' : 'bg-gray-900 text-white hover:bg-red-600'}`}>
              Ver Detalles Completos
            </button>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedVehicle && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVehicle(null)}
        >
          <div
            className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white'} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedVehicle.model}</h2>
                <p className="text-gray-300 font-mono text-sm">{selectedVehicle.vin}</p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div>
                <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Información del Cliente
                </h3>
                <div className={`grid md:grid-cols-2 gap-4 rounded-lg p-4 ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-50'}`}>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Nombre</p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedVehicle.client}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Fecha de Entrega</p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedVehicle.deliveryDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Progress */}
              <div>
                <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Progreso de Pagos</h3>
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {selectedVehicle.ownership}%
                    </span>
                    <span className="text-gray-600">Completado</span>
                  </div>
                  <div className="h-4 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                      style={{ width: `${selectedVehicle.ownership}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Detalles Financieros</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-50'}`}>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Cuota Semanal</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(selectedVehicle.weeklyPayment)}
                    </p>
                  </div>
                  <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-50'}`}>
                    <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Semanas Pagadas</p>
                    <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedVehicle.weeksPaid} / {selectedVehicle.totalWeeks}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedVehicle.totalPaid)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedVehicle.totalValue)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Payment */}
              <div>
                <h3 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Último Pago</h3>
                <div className={`flex items-center gap-3 rounded-lg p-4 ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-50'}`}>
                  <Calendar className={`w-10 h-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Fecha</p>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedVehicle.lastPaymentDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
