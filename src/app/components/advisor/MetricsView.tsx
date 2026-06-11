import { TrendingUp, Users, Car, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function MetricsView() {
  const { theme } = useTheme();

  const metrics = [
    {
      label: 'Solicitudes Activas',
      value: '23',
      change: '+12%',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Entregas Pendientes',
      value: '8',
      change: '+3 esta semana',
      icon: Car,
      color: 'blue',
    },
    {
      label: 'Aprobadas este mes',
      value: '45',
      change: '+28%',
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Rechazadas este mes',
      value: '12',
      change: '-15%',
      icon: XCircle,
      color: 'red',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dashboard de Métricas</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Vista general del estado de las solicitudes</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    metric.color === 'blue'
                      ? 'bg-blue-100'
                      : metric.color === 'blue'
                      ? 'bg-blue-100'
                      : metric.color === 'green'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      metric.color === 'blue'
                        ? 'text-blue-600'
                        : metric.color === 'blue'
                        ? 'text-blue-700'
                        : metric.color === 'green'
                        ? 'text-green-600'
                        : 'text-red-600'
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

      {/* Recent Activity */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Actividad Reciente</h2>
        <div className="space-y-4">
          {[
            {
              user: 'Juan Pérez',
              action: 'Solicitud aprobada',
              time: 'Hace 30 minutos',
              status: 'success',
            },
            {
              user: 'María González',
              action: 'Documentos pendientes',
              time: 'Hace 1 hora',
              status: 'warning',
            },
            {
              user: 'Carlos Ruiz',
              action: 'Entrega programada',
              time: 'Hace 2 horas',
              status: 'info',
            },
          ].map((activity, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1A1FE8] to-[#3D42F0] rounded-full flex items-center justify-center text-white font-bold">
                  {activity.user.charAt(0)}
                </div>
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activity.user}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{activity.action}</p>
                </div>
              </div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
