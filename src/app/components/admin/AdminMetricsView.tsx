import { Car, DollarSign, TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function AdminMetricsView() {
  const { theme } = useTheme();

  const metrics = [
    {
      label: 'Vehículos Entregados',
      value: '156',
      change: '+12 este mes',
      icon: Car,
      color: 'blue',
    },
    {
      label: 'Ingresos del Mes',
      value: '$140.4M',
      change: '+8.5%',
      icon: DollarSign,
      color: 'green',
    },
    {
      label: 'Pagos al Día',
      value: '142',
      change: '91% del total',
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Pagos en Riesgo',
      value: '14',
      change: '9% del total',
      icon: AlertTriangle,
      color: 'orange',
    },
    {
      label: 'Vehículos Retenidos',
      value: '3',
      change: '-2 esta semana',
      icon: AlertTriangle,
      color: 'red',
    },
    {
      label: 'Usuarios Activos',
      value: '156',
      change: '+23 este mes',
      icon: Users,
      color: 'blue',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dashboard Administrativo</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Vista general del sistema DriveOwn</p>
      </div>

      {/* Main Metrics */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100 hover:shadow-xl'} rounded-2xl p-6 transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    metric.color === 'blue'
                      ? 'bg-blue-100'
                      : metric.color === 'green'
                      ? 'bg-green-100'
                      : metric.color === 'orange'
                      ? 'bg-orange-100'
                      : metric.color === 'red'
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      metric.color === 'blue'
                        ? 'text-blue-600'
                        : metric.color === 'green'
                        ? 'text-green-600'
                        : metric.color === 'orange'
                        ? 'text-orange-600'
                        : metric.color === 'red'
                        ? 'text-red-600'
                        : 'text-blue-700'
                    }`}
                  />
                </div>
              </div>
              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{metric.label}</p>
              <p className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{metric.value}</p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{metric.change}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
          <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ingresos por Mes</h2>
          <div className="space-y-3">
            {[
              { month: 'Enero', amount: 125000000, percentage: 85 },
              { month: 'Febrero', amount: 132000000, percentage: 90 },
              { month: 'Marzo', amount: 128500000, percentage: 87 },
              { month: 'Abril', amount: 135200000, percentage: 92 },
              { month: 'Mayo', amount: 140400000, percentage: 95 },
            ].map((item) => (
              <div key={item.month}>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{item.month}</span>
                  <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${(item.amount / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-100'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
          <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Estado de Pagos</h2>
          <div className="space-y-4">
            {[
              { status: 'Al día', count: 142, percentage: 91, color: 'green' },
              { status: 'Retrasado (1-5 días)', count: 8, percentage: 5, color: 'yellow' },
              { status: 'Crítico (6+ días)', count: 6, percentage: 4, color: 'red' },
            ].map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      item.color === 'green'
                        ? 'bg-green-500'
                        : item.color === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{item.status}</span>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.count}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Alertas Recientes</h2>
        <div className="space-y-3">
          {[
            {
              message: 'Pago vencido - Cliente: Juan Pérez (VIN: LNBM2EV3XN1234567)',
              time: 'Hace 30 min',
              type: 'critical',
            },
            {
              message: 'Vehículo entregado - Cliente: María González',
              time: 'Hace 2 horas',
              type: 'success',
            },
            {
              message: 'Pago próximo a vencer - Cliente: Carlos Ruiz',
              time: 'Hace 4 horas',
              type: 'warning',
            },
          ].map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg flex items-start gap-3 ${
                alert.type === 'critical'
                  ? 'bg-red-50 border border-red-200'
                  : alert.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  alert.type === 'critical'
                    ? 'text-red-600'
                    : alert.type === 'success'
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}
              />
              <div className="flex-1">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-900' : 'text-gray-900'}`}>{alert.message}</p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
