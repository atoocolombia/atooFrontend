import { AlertTriangle, Clock, Phone, Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function PaymentRiskView() {
  const { theme } = useTheme();

  const riskVehicles = [
    {
      id: 1,
      client: 'Carlos Rodríguez',
      phone: '+57 320 111 2222',
      email: 'carlos.r@email.com',
      vin: 'LNBM2EV3XN1234569',
      model: 'Nammi EV Plus 2026',
      daysLate: 5,
      amountDue: 253000,
      lastPaymentDate: '2026-05-18',
      riskLevel: 'medium',
    },
    {
      id: 2,
      client: 'Ana López',
      phone: '+57 315 333 4444',
      email: 'ana.lopez@email.com',
      vin: 'LNBM2EV3XN1234570',
      model: 'Nammi EV 2026',
      daysLate: 2,
      amountDue: 207000,
      lastPaymentDate: '2026-05-26',
      riskLevel: 'low',
    },
    {
      id: 3,
      client: 'Roberto Sánchez',
      phone: '+57 310 555 6666',
      email: 'roberto.s@email.com',
      vin: 'LNBM2EV3XN1234571',
      model: 'Nammi EV 2026',
      daysLate: 8,
      amountDue: 207000,
      lastPaymentDate: '2026-05-10',
      riskLevel: 'high',
    },
  ];

  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'high':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' };
      case 'medium':
        return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' };
      default:
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' };
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high':
        return 'Alto Riesgo';
      case 'medium':
        return 'Riesgo Medio';
      default:
        return 'Bajo Riesgo';
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
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pagos en Riesgo</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Vehículos con pagos próximos a vencer o vencidos
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Alto Riesgo</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {riskVehicles.filter(v => v.riskLevel === 'high').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Riesgo Medio</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {riskVehicles.filter(v => v.riskLevel === 'medium').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total en Riesgo</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{riskVehicles.length}</p>
        </div>
      </div>

      {/* Risk Vehicles List */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Clientes con Pagos Vencidos o Próximos a Vencer
        </h2>

        <div className="space-y-4">
          {riskVehicles.map((vehicle) => {
            const style = getRiskStyle(vehicle.riskLevel);
            return (
              <div
                key={vehicle.id}
                className={`border-2 ${style.border} ${style.bg} rounded-xl p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${style.badge} rounded-full flex items-center justify-center ${style.text} font-bold text-lg`}>
                      {vehicle.client.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{vehicle.client}</h3>
                      <p className="text-sm text-gray-600">{vehicle.model}</p>
                      <p className="text-xs text-gray-500 font-mono">{vehicle.vin}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.badge} ${style.text}`}>
                    {getRiskLabel(vehicle.riskLevel)}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Días de Retraso</p>
                    <p className={`text-2xl font-bold ${style.text}`}>{vehicle.daysLate} días</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Monto Vencido</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(vehicle.amountDue)}
                    </p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-1">Último Pago</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(vehicle.lastPaymentDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-300/20' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {vehicle.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {vehicle.email}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className={`flex-1 px-4 py-2 rounded-lg transition-colors font-semibold ${theme === 'dark' ? 'bg-[#141638] text-white hover:bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                    Contactar Cliente
                  </button>
                  <button className={`flex-1 px-4 py-2 border-2 rounded-lg transition-colors font-semibold ${theme === 'dark' ? 'border-[#1A1FE8]/30 text-gray-300 hover:bg-[#141638]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    Ver Historial
                  </button>
                  {vehicle.daysLate >= 6 && (
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                      Iniciar Retención
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
