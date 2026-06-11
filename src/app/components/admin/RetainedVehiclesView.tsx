import { Lock, AlertCircle, MapPin, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function RetainedVehiclesView() {
  const { theme } = useTheme();

  const retainedVehicles = [
    {
      id: 1,
      client: 'Pedro Martínez',
      phone: '+57 300 777 8888',
      vin: 'LNBM2EV3XN1234572',
      model: 'Nammi EV 2026',
      daysRetained: 15,
      amountOwed: 2700000,
      retentionDate: '2026-04-01',
      lastKnownLocation: 'Calle 72 #10-34, Bogotá',
      status: 'immobilized',
      monthsOwed: 3,
    },
    {
      id: 2,
      client: 'Laura Díaz',
      phone: '+57 315 888 9999',
      vin: 'LNBM2EV3XN1234573',
      model: 'Nammi EV Plus 2026',
      daysRetained: 8,
      amountOwed: 2200000,
      retentionDate: '2026-04-08',
      lastKnownLocation: 'Av. 68 #45-10, Bogotá',
      status: 'located',
      monthsOwed: 2,
    },
    {
      id: 3,
      client: 'Diego Torres',
      phone: '+57 320 999 0000',
      vin: 'LNBM2EV3XN1234574',
      model: 'Nammi EV 2026',
      daysRetained: 3,
      amountOwed: 3600000,
      retentionDate: '2026-04-13',
      lastKnownLocation: 'Ubicación desconocida',
      status: 'tracking',
      monthsOwed: 4,
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'immobilized':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Inmovilizado' };
      case 'located':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Localizado' };
      default:
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En Rastreo' };
    }
  };

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
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Vehículos Retenidos</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Vehículos inmovilizados o en proceso de recuperación por falta de pago
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Inmovilizados</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {retainedVehicles.filter(v => v.status === 'immobilized').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Localizados</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {retainedVehicles.filter(v => v.status === 'located').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>En Rastreo</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {retainedVehicles.filter(v => v.status === 'tracking').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-100'}`}>
              <AlertCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{retainedVehicles.length}</p>
        </div>
      </div>

      {/* Retained Vehicles List */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Vehículos en Proceso de Recuperación
        </h2>

        <div className="space-y-4">
          {retainedVehicles.map((vehicle) => {
            const statusStyle = getStatusStyle(vehicle.status);
            return (
              <div
                key={vehicle.id}
                className="border-2 border-red-200 bg-red-50 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
                      {vehicle.client.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{vehicle.client}</h3>
                      <p className="text-sm text-gray-600">{vehicle.model}</p>
                      <p className="text-xs text-gray-500 font-mono">{vehicle.vin}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Días Retenido</p>
                    <p className="text-2xl font-bold text-red-600">{vehicle.daysRetained}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Deuda Total</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(vehicle.amountOwed)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Meses Adeudados</p>
                    <p className="text-2xl font-bold text-gray-900">{vehicle.monthsOwed}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Fecha Retención</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(vehicle.retentionDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Última Ubicación Conocida</p>
                      <p className="font-semibold text-gray-900">{vehicle.lastKnownLocation}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg mb-4 ${
                  vehicle.status === 'immobilized' ? 'bg-red-100 border border-red-200' :
                  vehicle.status === 'located' ? 'bg-orange-100 border border-orange-200' :
                  'bg-yellow-100 border border-yellow-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      vehicle.status === 'immobilized' ? 'text-red-600' :
                      vehicle.status === 'located' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`} />
                    <div className="text-sm">
                      {vehicle.status === 'immobilized' && (
                        <p className="text-red-800">
                          <strong>Vehículo inmovilizado remotamente.</strong> Sistema apagado.
                          Cliente contactado. Esperando pago para reactivar.
                        </p>
                      )}
                      {vehicle.status === 'located' && (
                        <p className="text-orange-800">
                          <strong>Vehículo localizado.</strong> Equipo de recuperación notificado.
                          Preparando proceso de retoma física.
                        </p>
                      )}
                      {vehicle.status === 'tracking' && (
                        <p className="text-yellow-800">
                          <strong>Rastreando ubicación.</strong> Sistema GPS activo.
                          Cliente no responde llamadas. Última señal hace 2 horas.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className={`flex-1 px-4 py-2 rounded-lg transition-colors font-semibold ${theme === 'dark' ? 'bg-[#141638] text-white hover:bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                    Contactar Cliente
                  </button>
                  <button className={`flex-1 px-4 py-2 border-2 rounded-lg transition-colors font-semibold ${theme === 'dark' ? 'border-[#1A1FE8]/30 text-gray-300 hover:bg-[#141638]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    Ver Historial GPS
                  </button>
                  {vehicle.status === 'located' && (
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                      Enviar Equipo
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-red-900 mb-2">⚠️ Protocolo de Retención Activo</h3>
            <p className="text-sm text-red-800">
              Todos los vehículos listados han superado el período de gracia de 12 horas post-vencimiento.
              El sistema de inmovilización remota ha sido activado. Se ha notificado al departamento legal
              para iniciar el proceso de recuperación de activos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
