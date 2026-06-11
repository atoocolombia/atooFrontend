import { Trophy, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ProgressView() {
  const { theme } = useTheme();

  // Datos simulados - en producción vendrían del servidor
  const totalCost = 25000; // Costo total del vehículo
  const paidAmount = 15000; // Cantidad pagada
  const weeklyPayment = 115; // Pago semanal
  const weeksPaid = 130; // Semanas pagadas
  const totalWeeks = 260; // Total de semanas del plan (60 meses * 4.33 semanas/mes)
  const totalMonths = 60; // Total de meses del plan
  const percentage = Math.round((paidAmount / totalCost) * 100);
  const remainingAmount = totalCost - paidAmount;
  const remainingWeeks = totalWeeks - weeksPaid;
  const remainingMonths = Math.round(remainingWeeks / 4.33);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#7c3aed]'}`}>Mi Progreso</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Seguimiento de tu camino hacia la propiedad total del vehículo
        </p>
      </div>

      {/* Main Progress Card */}
      <div className={`rounded-3xl shadow-2xl p-8 text-white transition-colors ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#1A1FE8]/30 to-[#1217C8]/20 border border-blue-600/20'
          : 'bg-gradient-to-br from-blue-600 to-indigo-700'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Progreso de Propiedad</h2>
            <p className={theme === 'dark' ? 'text-blue-200' : 'text-blue-100'}>Cada pago te acerca más a tu meta</p>
          </div>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm ${
            theme === 'dark' ? 'bg-blue-600/20' : 'bg-white/20'
          }`}>
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>

        {/* Percentage Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-6xl font-bold">{percentage}%</span>
            <span className={`text-2xl ${theme === 'dark' ? 'text-blue-200' : 'text-blue-100'}`}>completado</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className={`h-8 rounded-full overflow-hidden backdrop-blur-sm ${
            theme === 'dark' ? 'bg-blue-950/30' : 'bg-white/20'
          }`}>
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          {/* Goal Trophy Icon */}
          <div className="absolute -right-2 top-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <Trophy className="w-6 h-6 text-yellow-900" />
              </div>
              {percentage >= 90 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping" />
              )}
            </div>
          </div>
        </div>

        {/* Amount Info */}
        <div className="mt-6 flex justify-between items-center">
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-100'}`}>Pagado</p>
            <p className="text-2xl font-bold">
              ${paidAmount.toLocaleString('es-MX')}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-100'}`}>Restante</p>
            <p className="text-2xl font-bold">
              ${remainingAmount.toLocaleString('es-MX')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Weekly Payment */}
        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${
          theme === 'dark'
            ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pago Semanal</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${weeklyPayment.toLocaleString('es-MX')}
              </p>
            </div>
          </div>
          <div className={`pt-4 border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Próximo pago: <span className="font-semibold">8 Jun 2026</span>
            </p>
          </div>
        </div>

        {/* Weeks Paid */}
        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${
          theme === 'dark'
            ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
            }`}>
              <Calendar className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Semanas Pagadas</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {weeksPaid} / {totalWeeks}
              </p>
            </div>
          </div>
          <div className={`pt-4 border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Tiempo restante: <span className="font-semibold">{remainingWeeks} semanas ({remainingMonths} meses)</span>
            </p>
          </div>
        </div>

        {/* Total Investment */}
        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${
          theme === 'dark'
            ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
            }`}>
              <Trophy className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'}`} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Valor Total</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${totalCost.toLocaleString('es-MX')}
              </p>
            </div>
          </div>
          <div className={`pt-4 border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Fecha estimada: <span className="font-semibold">Jun 2031</span>
            </p>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${
        theme === 'dark'
          ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
          : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          🎯 Hitos de Propiedad
        </h3>

        <div className="space-y-4">
          {[
            { milestone: 25, label: '25% - Acceso a mantenimiento preferencial', completed: true },
            { milestone: 50, label: '50% - Posibilidad de renovar vehículo', completed: true },
            { milestone: 75, label: '75% - Descuento en seguro', completed: percentage >= 75 },
            { milestone: 100, label: '100% - ¡El vehículo es tuyo!', completed: percentage >= 100 },
          ].map((item) => (
            <div key={item.milestone} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  item.completed
                    ? 'bg-green-500 text-white'
                    : theme === 'dark'
                      ? 'bg-blue-600/20 text-gray-500'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {item.completed ? '✓' : item.milestone}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    item.completed
                      ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </p>
              </div>
              {item.completed && (
                <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                  Completado
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Message */}
      {percentage < 100 && (
        <div className={`rounded-2xl p-6 border transition-colors ${
          theme === 'dark'
            ? 'bg-blue-600/10 border-blue-600/30'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
        }`}>
          <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
            💪 ¡Sigue así, vas excelente!
          </h4>
          <p className={theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}>
            {percentage >= 75
              ? '¡Estás muy cerca de tu meta! Solo faltan unos pocos pagos más.'
              : percentage >= 50
              ? '¡Ya superaste la mitad del camino! Continúa con tu buen ritmo de pagos.'
              : '¡Gran inicio! Cada pago te acerca más a tu vehículo propio.'}
          </p>
        </div>
      )}
    </div>
  );
}
