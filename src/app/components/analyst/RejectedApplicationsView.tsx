import { XCircle, Calendar, User, MessageSquare } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface RejectedCheck {
  type: 'judicial' | 'procuraduria' | 'simit';
  label: string;
  comment: string;
}

interface RejectedApplication {
  id: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rejectedBy: string;
  rejectedDate: string;
  rejectedTime: string;
  rejectedChecks: RejectedCheck[];
}

const mockRejectedApplications: RejectedApplication[] = [
  {
    id: '1',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '3344556677',
    firstName: 'Andrés Felipe',
    lastName: 'Moreno Díaz',
    email: 'andres.moreno@email.com',
    phone: '+57 314 334 4556',
    rejectedBy: 'Ana María Sánchez',
    rejectedDate: '2026-06-02',
    rejectedTime: '09:30',
    rejectedChecks: [
      {
        type: 'judicial',
        label: 'Antecedentes Judiciales',
        comment: 'Se encontraron antecedentes judiciales vigentes que impiden la aprobación del crédito.',
      },
    ],
  },
  {
    id: '2',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '6677889900',
    firstName: 'Camila Andrea',
    lastName: 'Gutiérrez Parra',
    email: 'camila.gutierrez@email.com',
    phone: '+57 317 667 7889',
    rejectedBy: 'Carlos Rodríguez López',
    rejectedDate: '2026-05-31',
    rejectedTime: '15:20',
    rejectedChecks: [
      {
        type: 'simit',
        label: 'Multas SIMIT',
        comment: 'Presenta múltiples multas de tránsito sin pagar por un valor superior a $5,000,000 COP.',
      },
    ],
  },
  {
    id: '3',
    documentType: 'Cédula de Extranjería',
    documentNumber: '4455667788',
    firstName: 'Miguel Ángel',
    lastName: 'Fernández Ríos',
    email: 'miguel.fernandez@email.com',
    phone: '+57 319 445 5667',
    rejectedBy: 'Ana María Sánchez',
    rejectedDate: '2026-05-29',
    rejectedTime: '11:45',
    rejectedChecks: [
      {
        type: 'procuraduria',
        label: 'Antecedentes Procuraduría',
        comment: 'Tiene sanciones disciplinarias vigentes en Procuraduría.',
      },
      {
        type: 'judicial',
        label: 'Antecedentes Judiciales',
        comment: 'Proceso penal en curso.',
      },
    ],
  },
];

export function RejectedApplicationsView() {
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
            Solicitudes Denegadas
          </h1>
          <span className="px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500 text-red-500 font-bold text-lg shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            {mockRejectedApplications.length}
          </span>
        </div>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {mockRejectedApplications.length === 0
            ? 'No hay solicitudes denegadas'
            : `${mockRejectedApplications.length} ${mockRejectedApplications.length === 1 ? 'solicitud denegada' : 'solicitudes denegadas'}`
          }
        </p>
      </div>

      <div className="grid gap-6">
        {mockRejectedApplications.length === 0 ? (
          <div
            className={`rounded-2xl p-12 text-center border ${
              theme === 'dark'
                ? 'bg-[#0D0F2E]/50 backdrop-blur-xl border-blue-600/20'
                : 'bg-white border-gray-200'
            }`}
          >
            <XCircle className={`w-16 h-16 mx-auto mb-4 ${
              theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No hay solicitudes denegadas
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Las solicitudes denegadas aparecerán aquí
            </p>
          </div>
        ) : (
          mockRejectedApplications.map((app) => (
            <div
              key={app.id}
              className={`rounded-2xl p-6 border transition-all ${
                theme === 'dark'
                  ? 'bg-[#0D0F2E]/50 backdrop-blur-xl border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                  : 'bg-white border-red-200 shadow-lg'
              }`}
            >
              {/* Header con badge de denegado */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {app.firstName} {app.lastName}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 border border-red-500 text-red-500 text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Denegado
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

              {/* Información de rechazo */}
              <div className={`grid md:grid-cols-2 gap-4 p-4 rounded-xl mb-4 ${
                theme === 'dark'
                  ? 'bg-red-500/10 border border-red-500/20'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                  }`}>
                    <User className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Denegado por
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                      {app.rejectedBy}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                  }`}>
                    <Calendar className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                      Fecha de denegación
                    </p>
                    <p className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                      {formatDate(app.rejectedDate)} - {app.rejectedTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Motivos de rechazo */}
              <div className={`p-4 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-[#06071A]/50 border-red-500/20'
                  : 'bg-red-50/50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Motivos de denegación
                  </p>
                </div>
                <div className="space-y-3">
                  {app.rejectedChecks.map((check, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-[#0D0F2E]/50 border-red-500/20'
                          : 'bg-white border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className={`font-medium mb-1 ${
                            theme === 'dark' ? 'text-red-400' : 'text-red-700'
                          }`}>
                            {check.label}
                          </p>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {check.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
