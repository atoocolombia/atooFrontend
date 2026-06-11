import { UserX, AlertCircle, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function RejectedUsersView() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const rejectedUsers = [
    {
      id: 1,
      name: 'Pedro Martínez',
      email: 'pedro.martinez@email.com',
      phone: '+57 300 111 2222',
      rejectionDate: '2026-04-20',
      reason: 'Documentación Incompleta',
      details: 'No presentó comprobante de domicilio válido (más de 3 meses de antigüedad)',
      canReapply: true,
    },
    {
      id: 2,
      name: 'Ana López',
      email: 'ana.lopez@email.com',
      phone: '+57 310 222 3333',
      rejectionDate: '2026-04-18',
      reason: 'Score de Crédito Bajo',
      details: 'Puntaje crediticio de 450/850. Mínimo requerido: 600',
      canReapply: false,
    },
    {
      id: 3,
      name: 'Roberto Sánchez',
      email: 'roberto.sanchez@email.com',
      phone: '+57 320 333 4444',
      rejectionDate: '2026-04-15',
      reason: 'Referencias No Verificables',
      details: 'Las referencias comerciales y familiares no pudieron ser contactadas',
      canReapply: true,
    },
    {
      id: 4,
      name: 'Laura Díaz',
      email: 'laura.diaz@email.com',
      phone: '+57 315 444 5555',
      rejectionDate: '2026-04-10',
      reason: 'Ingresos Insuficientes',
      details: 'Ingresos semanales de $280,000. Mínimo requerido: $580,000',
      canReapply: false,
    },
  ];

  const filteredUsers = rejectedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRejectionColor = (reason: string) => {
    if (reason.includes('Crédito') || reason.includes('Ingresos')) return 'red';
    if (reason.includes('Documentación') || reason.includes('Referencias')) return 'orange';
    return 'yellow';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Usuarios Rechazados</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Historial de solicitudes rechazadas con motivos y detalles
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Total Rechazados</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{rejectedUsers.length}</p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pueden Re-aplicar</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {rejectedUsers.filter((u) => u.canReapply).length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-100'}`}>
              <Filter className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Este Mes</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>12</p>
        </div>
      </div>

      {/* Search */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o motivo de rechazo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
          />
        </div>
      </div>

      {/* Rejected Users List */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Solicitudes Rechazadas ({filteredUsers.length})
        </h2>

        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`border-2 rounded-xl p-6 transition-colors ${theme === 'dark' ? 'border-[#1A1FE8]/20 hover:border-red-400/40' : 'border-gray-200 hover:border-red-200'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                      getRejectionColor(user.reason) === 'red'
                        ? 'bg-red-100 text-red-700'
                        : getRejectionColor(user.reason) === 'orange'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {user.reason}
                  </span>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(user.rejectionDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <div className={`rounded-lg p-4 mb-4 ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-50'}`}>
                <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Detalles del Rechazo:
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{user.details}</p>
              </div>

              <div className={`flex items-center justify-between pt-4 border-t ${theme === 'dark' ? 'border-[#1A1FE8]/20' : 'border-gray-200'}`}>
                <div>
                  {user.canReapply ? (
                    <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Puede volver a aplicar
                    </span>
                  ) : (
                    <span className="text-sm text-red-600 font-semibold flex items-center gap-1">
                      <UserX className="w-4 h-4" />
                      No puede re-aplicar
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className={`px-4 py-2 border-2 rounded-lg transition-colors text-sm font-semibold ${theme === 'dark' ? 'border-[#1A1FE8]/30 text-gray-300 hover:bg-[#141638]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    Ver Detalles
                  </button>
                  {user.canReapply && (
                    <button className="px-4 py-2 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors text-sm font-semibold">
                      Contactar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rejection Reasons Summary */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Motivos de Rechazo Más Comunes
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { reason: 'Score de Crédito Bajo', count: 5, percentage: 42 },
            { reason: 'Documentación Incompleta', count: 3, percentage: 25 },
            { reason: 'Ingresos Insuficientes', count: 2, percentage: 17 },
            { reason: 'Referencias No Verificables', count: 2, percentage: 17 },
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-50'}`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.reason}</h4>
                <span className="text-sm font-bold text-[#1A1FE8]">{item.count}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#0D0F2E]' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-[#1A1FE8] rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.percentage}% del total</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
