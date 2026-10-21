import { Trophy, TrendingUp, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCop, formatNextPaymentDate, useClientPaymentSummary } from '../../../lib/clientPaymentsApi';

export function ProgressView() {
  const { theme } = useTheme();
  const { summary, loading, error } = useClientPaymentSummary();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-[#1A1FE8]" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div
        className={`rounded-2xl border p-8 max-w-xl ${theme === 'dark' ? 'border-amber-500/40 bg-amber-500/10' : 'border-amber-300 bg-amber-50'}`}
      >
        <p className={`font-semibold ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'}`}>
          No pudimos cargar tus pagos registrados
        </p>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-amber-200/90' : 'text-amber-800'}`}>
          {error ??
            'El servidor no respondió. Si acabas de registrar un pago, espera unos minutos y recarga la página (Cmd+Shift+R).'}
        </p>
      </div>
    );
  }

  const installmentPlan = summary.installmentPlan ?? false;
  const totalCuotas = summary.planInstallments ?? summary.planWeeks;
  const totalCostCop = summary.weeklyPaymentCop * totalCuotas;
  const paidAmount = summary.totalPaidCop;
  const cuotaAmount = summary.weeklyPaymentCop;
  const cuotasPaid = summary.installmentsPaid ?? summary.weeksRecognized;
  const remainingCuotas = summary.remainingInstallments ?? summary.remainingWeeks;
  const percentage = summary.progressPercent;
  const remainingAmount = Math.max(0, totalCostCop - paidAmount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#7c3aed]'}`}>
          Mi Progreso
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Seguimiento de tu camino hacia la propiedad total del vehículo
        </p>
      </div>

      <div
        className={`rounded-3xl shadow-2xl p-8 text-white transition-colors ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-[#1A1FE8]/30 to-[#1217C8]/20 border border-blue-600/20'
            : 'bg-gradient-to-br from-blue-600 to-indigo-700'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Progreso de Propiedad</h2>
            <p className={theme === 'dark' ? 'text-blue-200' : 'text-blue-100'}>
              {summary.paymentsCount > 0
                ? installmentPlan
                  ? `${cuotasPaid} de ${totalCuotas} cuotas registradas por atoo`
                  : 'Basado en los pagos registrados por atoo'
                : 'Aún no hay pagos registrados a tu nombre'}
            </p>
          </div>
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm ${
              theme === 'dark' ? 'bg-blue-600/20' : 'bg-white/20'
            }`}
          >
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-6xl font-bold">{percentage}%</span>
            <span className={`text-2xl ${theme === 'dark' ? 'text-blue-200' : 'text-blue-100'}`}>
              completado
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            className={`h-8 rounded-full overflow-hidden backdrop-blur-sm ${
              theme === 'dark' ? 'bg-blue-950/30' : 'bg-white/20'
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
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

        <div className="mt-6 flex justify-between items-center">
          <div>
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-100'}`}>Pagado</p>
            <p className="text-2xl font-bold">{formatCop(paidAmount)}</p>
          </div>
          <div className="text-right">
            <p className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-100'}`}>Restante estimado</p>
            <p className="text-2xl font-bold">{formatCop(remainingAmount)}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div
          className={`rounded-2xl shadow-lg p-6 border transition-colors ${
            theme === 'dark'
              ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
              : 'bg-white border-gray-100'
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}
            >
              <DollarSign className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {installmentPlan ? 'Valor cuota' : 'Cuota referencia'}
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCop(cuotaAmount)}
              </p>
            </div>
          </div>
          <div className={`pt-4 border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Próximo pago:{' '}
              <span className="font-semibold">{formatNextPaymentDate(summary.nextPaymentDueAt)}</span>
            </p>
          </div>
        </div>

        <div
          className={`rounded-2xl shadow-lg p-6 border transition-colors ${
            theme === 'dark'
              ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
              : 'bg-white border-gray-100'
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
              }`}
            >
              <Calendar className={`w-6 h-6 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {installmentPlan ? 'Cuotas pagadas' : 'Semanas equivalentes'}
              </p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {cuotasPaid} / {totalCuotas}
              </p>
            </div>
          </div>
          <div className={`pt-4 border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {installmentPlan ? (
                <>
                  Cuotas pendientes: <span className="font-semibold">{remainingCuotas}</span>
                </>
              ) : (
                <>
                  Tiempo restante:{' '}
                  <span className="font-semibold">
                    {summary.remainingWeeks} semanas (
                    {Math.max(0, Math.round(summary.remainingWeeks / 4.33))} meses)
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div
          className={`rounded-2xl shadow-lg p-6 border transition-colors ${
            theme === 'dark'
              ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
              : 'bg-white border-gray-100'
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
              }`}
            >
              <Trophy className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-700'}`} />
            </div>
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pagos registrados</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {summary.paymentsCount}
              </p>
            </div>
          </div>
          <div className={`pt-4 border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'}`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {installmentPlan ? 'Total del plan' : 'Plan estimado'}: {formatCop(totalCostCop)}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl shadow-lg p-8 border transition-colors ${
          theme === 'dark'
            ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
            : 'bg-white border-gray-100'
        }`}
      >
        <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Hitos de propiedad
        </h3>
        <div className="space-y-4">
          {[
            { milestone: 25, label: '25% — Acceso a mantenimiento preferencial', completed: percentage >= 25 },
            { milestone: 50, label: '50% — Mitad del plan', completed: percentage >= 50 },
            { milestone: 75, label: '75% — Recta final', completed: percentage >= 75 },
            { milestone: 100, label: '100% — El vehículo es tuyo', completed: percentage >= 100 },
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
                      ? theme === 'dark'
                        ? 'text-white'
                        : 'text-gray-900'
                      : theme === 'dark'
                        ? 'text-gray-400'
                        : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
