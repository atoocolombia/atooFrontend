import { User, CheckCircle, AlertTriangle, Clock, Phone, Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function ActiveUsersView() {
  const { theme } = useTheme();

  const users = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+57 310 123 4567',
      vin: 'LNBM2EV3XN1234567',
      model: 'Nammi EV 2026',
      deliveryDate: '2026-01-15',
      monthsPaid: 30,
      totalMonths: 60,
      lastPaymentDate: '2026-04-15',
      nextPaymentDate: '2026-05-15',
      paymentStatus: 'current',
      ownership: 60,
    },
    {
      id: 2,
      name: 'María González',
      email: 'maria.g@email.com',
      phone: '+57 315 234 5678',
      vin: 'LNBM2EV3XN1234568',
      model: 'Nammi EV 2026',
      deliveryDate: '2025-11-20',
      monthsPaid: 35,
      totalMonths: 60,
      lastPaymentDate: '2026-04-20',
      nextPaymentDate: '2026-05-20',
      paymentStatus: 'current',
      ownership: 70,
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos.r@email.com',
      phone: '+57 320 111 2222',
      vin: 'LNBM2EV3XN1234569',
      model: 'Nammi EV Plus 2026',
      deliveryDate: '2026-02-10',
      monthsPaid: 25,
      totalMonths: 60,
      lastPaymentDate: '2026-03-10',
      nextPaymentDate: '2026-04-10',
      paymentStatus: 'late',
      ownership: 46,
    },
    {
      id: 4,
      name: 'Ana López',
      email: 'ana.lopez@email.com',
      phone: '+57 315 333 4444',
      vin: 'LNBM2EV3XN1234570',
      model: 'Nammi EV 2026',
      deliveryDate: '2026-03-05',
      monthsPaid: 18,
      totalMonths: 60,
      lastPaymentDate: '2026-04-08',
      nextPaymentDate: '2026-05-08',
      paymentStatus: 'warning',
      ownership: 36,
    },
    {
      id: 5,
      name: 'Roberto Sánchez',
      email: 'roberto.s@email.com',
      phone: '+57 310 555 6666',
      vin: 'LNBM2EV3XN1234571',
      model: 'Nammi EV 2026',
      deliveryDate: '2026-02-28',
      monthsPaid: 22,
      totalMonths: 60,
      lastPaymentDate: '2026-03-01',
      nextPaymentDate: '2026-04-01',
      paymentStatus: 'late',
      ownership: 44,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Al Día' };
      case 'warning':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Próximo' };
      default:
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Atrasado' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Usuarios Activos</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Listado completo de clientes con vehículos en circulación
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Usuarios</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{users.length}</p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pagos al Día</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {users.filter(u => u.paymentStatus === 'current').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Próximo Vencimiento</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {users.filter(u => u.paymentStatus === 'warning').length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Atrasados</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {users.filter(u => u.paymentStatus === 'late').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl overflow-hidden`}>
        <div className="p-8">
          <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Listado de Usuarios</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-y ${theme === 'dark' ? 'bg-[#141638] border-[#1A1FE8]/20' : 'bg-gray-50 border-gray-200'}`}>
              <tr>
                <th className={`text-left py-4 px-6 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Cliente</th>
                <th className={`text-left py-4 px-6 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Vehículo</th>
                <th className={`text-left py-4 px-6 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Progreso</th>
                <th className={`text-left py-4 px-6 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Último Pago</th>
                <th className={`text-left py-4 px-6 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Próximo Pago</th>
                <th className={`text-left py-4 px-6 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Estado</th>
                <th className={`text-left py-4 px-6 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Contacto</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => {
                const statusBadge = getStatusBadge(user.paymentStatus);
                return (
                  <tr
                    key={user.id}
                    className={`border-b transition-colors ${
                      theme === 'dark'
                        ? 'border-[#1A1FE8]/15 hover:bg-[#141638]'
                        : `border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`
                    }`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${theme === 'dark' ? 'bg-[#141638] text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                          <p className={`text-xs font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.vin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.model}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Entregado: {new Date(user.deliveryDate).toLocaleDateString('es-ES')}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-32">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{user.ownership}%</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-200'}`}>
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                            style={{ width: `${user.ownership}%` }}
                          />
                        </div>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {user.monthsPaid}/{user.totalMonths} meses
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(user.lastPaymentDate).toLocaleDateString('es-ES')}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(user.nextPaymentDate).toLocaleDateString('es-ES')}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Phone className="w-4 h-4" />
                          <span className="text-xs">{user.phone}</span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          <Mail className="w-4 h-4" />
                          <span className="text-xs">{user.email}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
