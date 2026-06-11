import { CheckCircle, Calendar, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ApprovedApplication {
  id: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  approvedBy: string;
  approvedDate: string;
  approvedTime: string;
}

const mockApprovedApplications: ApprovedApplication[] = [
  {
    id: '1',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '1122334455',
    firstName: 'Laura Patricia',
    lastName: 'González Ruiz',
    email: 'laura.gonzalez@email.com',
    phone: '+57 315 223 4455',
    approvedBy: 'Ana María Sánchez',
    approvedDate: '2026-06-01',
    approvedTime: '14:30',
  },
  {
    id: '2',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '9988776655',
    firstName: 'Diego Alejandro',
    lastName: 'Torres Vargas',
    email: 'diego.torres@email.com',
    phone: '+57 318 998 7766',
    approvedBy: 'Carlos Rodríguez López',
    approvedDate: '2026-05-30',
    approvedTime: '10:15',
  },
  {
    id: '3',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '5544332211',
    firstName: 'Sofía Marcela',
    lastName: 'Ramírez Castro',
    email: 'sofia.ramirez@email.com',
    phone: '+57 312 554 4332',
    approvedBy: 'Ana María Sánchez',
    approvedDate: '2026-05-28',
    approvedTime: '16:45',
  },
  {
    id: '4',
    documentType: 'Cédula de Extranjería',
    documentNumber: '7788990011',
    firstName: 'Roberto Carlos',
    lastName: 'Méndez Silva',
    email: 'roberto.mendez@email.com',
    phone: '+57 320 778 8990',
    approvedBy: 'Carlos Rodríguez López',
    approvedDate: '2026-05-27',
    approvedTime: '11:20',
  },
];

export function ApprovedApplicationsView() {
  const { theme } = useTheme();

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Solicitudes Aprobadas
          </h1>
          <span className="px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500 text-green-500 font-bold text-lg shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            {mockApprovedApplications.length}
          </span>
        </div>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {mockApprovedApplications.length === 0
            ? 'No hay solicitudes aprobadas'
            : `${mockApprovedApplications.length} ${mockApprovedApplications.length === 1 ? 'solicitud aprobada' : 'solicitudes aprobadas'}`
          }
        </p>
      </div>

      <div className="grid gap-6">
        {mockApprovedApplications.length === 0 ? (
          <div
            className={`rounded-2xl p-12 text-center border ${
              theme === 'dark'
                ? 'bg-[#0D0F2E]/50 backdrop-blur-xl border-blue-600/20'
                : 'bg-white border-gray-200'
            }`}
          >
            <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${
              theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No hay solicitudes aprobadas
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Las solicitudes aprobadas aparecerán aquí
            </p>
          </div>
        ) : (
          mockApprovedApplications.map((app) => (
            <div
              key={app.id}
              className={`rounded-2xl p-6 border transition-all ${
                theme === 'dark'
                  ? 'bg-[#0D0F2E]/50 backdrop-blur-xl border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]'
                  : 'bg-white border-green-200 shadow-lg'
              }`}
            >
              {/* Header con badge de aprobado */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {app.firstName} {app.lastName}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500 text-green-500 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Aprobado
                    </span>
                  </div>
                </div>
              </div>

              {/* Información del solicitante */}
              <div className={`grid md:grid-cols-2 gap-4 pb-4 mb-4 border-b ${
                theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'
              }`}>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    Tipo de Documento
                  </p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                    {app.documentType}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    Número de Documento
                  </p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                    {app.documentNumber}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    Correo Electrónico
                  </p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                    {app.email}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                    Teléfono
                  </p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                    {app.phone}
                  </p>
                </div>
              </div>

              {/* Información de aprobación */}
              <div className={`grid md:grid-cols-2 gap-4 p-4 rounded-xl ${
                theme === 'dark'
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                  }`}>
                    <User className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Aprobado por
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                      {app.approvedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                  }`}>
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Fecha de aprobación
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                      {formatDate(app.approvedDate)} - {app.approvedTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estado de revisiones */}
              <div className="mt-4 pt-4 border-t border-green-500/20">
                <p className={`text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Revisiones completadas:
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Antecedentes Judiciales
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Antecedentes Procuraduría
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Multas SIMIT
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
