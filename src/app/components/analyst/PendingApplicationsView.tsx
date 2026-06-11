import { useState } from 'react';
import { ExternalLink, CheckCircle, XCircle, Send } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface BackgroundCheck {
  id: string;
  type: 'judicial' | 'procuraduria' | 'simit';
  label: string;
  url: string;
  approved: boolean | null;
  comment: string;
}

interface Application {
  id: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  backgroundChecks: BackgroundCheck[];
}

const mockApplications: Application[] = [
  {
    id: '1',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '1234567890',
    firstName: 'Juan Carlos',
    lastName: 'Rodríguez García',
    email: 'juan.rodriguez@email.com',
    phone: '+57 300 123 4567',
    backgroundChecks: [
      {
        id: '1-judicial',
        type: 'judicial',
        label: 'Antecedentes Judiciales',
        url: 'https://antecedentes.policia.gov.co:7005/WebJudicial/',
        approved: null,
        comment: '',
      },
      {
        id: '1-procuraduria',
        type: 'procuraduria',
        label: 'Antecedentes Procuraduría',
        url: 'https://www.procuraduria.gov.co/Pages/Generacion-de-antecedentes.aspx',
        approved: null,
        comment: '',
      },
      {
        id: '1-simit',
        type: 'simit',
        label: 'Multas SIMIT',
        url: 'https://www.fcm.org.co/simit/#/home-public',
        approved: null,
        comment: '',
      },
    ],
  },
  {
    id: '2',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '9876543210',
    firstName: 'María Fernanda',
    lastName: 'López Martínez',
    email: 'maria.lopez@email.com',
    phone: '+57 310 987 6543',
    backgroundChecks: [
      {
        id: '2-judicial',
        type: 'judicial',
        label: 'Antecedentes Judiciales',
        url: 'https://antecedentes.policia.gov.co:7005/WebJudicial/',
        approved: null,
        comment: '',
      },
      {
        id: '2-procuraduria',
        type: 'procuraduria',
        label: 'Antecedentes Procuraduría',
        url: 'https://www.procuraduria.gov.co/Pages/Generacion-de-antecedentes.aspx',
        approved: null,
        comment: '',
      },
      {
        id: '2-simit',
        type: 'simit',
        label: 'Multas SIMIT',
        url: 'https://www.fcm.org.co/simit/#/home-public',
        approved: null,
        comment: '',
      },
    ],
  },
  {
    id: '3',
    documentType: 'Cédula de Extranjería',
    documentNumber: '5555666677',
    firstName: 'Carlos Eduardo',
    lastName: 'Pérez Sánchez',
    email: 'carlos.perez@email.com',
    phone: '+57 320 555 6677',
    backgroundChecks: [
      {
        id: '3-judicial',
        type: 'judicial',
        label: 'Antecedentes Judiciales',
        url: 'https://antecedentes.policia.gov.co:7005/WebJudicial/',
        approved: null,
        comment: '',
      },
      {
        id: '3-procuraduria',
        type: 'procuraduria',
        label: 'Antecedentes Procuraduría',
        url: 'https://www.procuraduria.gov.co/Pages/Generacion-de-antecedentes.aspx',
        approved: null,
        comment: '',
      },
      {
        id: '3-simit',
        type: 'simit',
        label: 'Multas SIMIT',
        url: 'https://www.fcm.org.co/simit/#/home-public',
        approved: null,
        comment: '',
      },
    ],
  },
];

export function PendingApplicationsView() {
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const { theme } = useTheme();

  const handleCheckChange = (appId: string, checkId: string, approved: boolean) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === appId
          ? {
              ...app,
              backgroundChecks: app.backgroundChecks.map(check =>
                check.id === checkId
                  ? { ...check, approved, comment: approved ? '' : check.comment }
                  : check
              ),
            }
          : app
      )
    );
  };

  const handleCommentChange = (appId: string, checkId: string, comment: string) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === appId
          ? {
              ...app,
              backgroundChecks: app.backgroundChecks.map(check =>
                check.id === checkId ? { ...check, comment } : check
              ),
            }
          : app
      )
    );
  };

  const handleSubmit = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const allChecked = app.backgroundChecks.every(check => check.approved !== null);
    const allApproved = app.backgroundChecks.every(check => check.approved === true);
    const hasComments = app.backgroundChecks
      .filter(check => check.approved === false)
      .every(check => check.comment.trim() !== '');

    if (!allChecked) {
      alert('Por favor complete todas las revisiones antes de enviar');
      return;
    }

    if (!allApproved && !hasComments) {
      alert('Por favor agregue comentarios para las revisiones no aprobadas');
      return;
    }

    alert(
      allApproved
        ? `Solicitud de ${app.firstName} ${app.lastName} aprobada exitosamente`
        : `Solicitud de ${app.firstName} ${app.lastName} denegada. Se ha notificado al solicitante.`
    );

    setApplications(prev => prev.filter(a => a.id !== appId));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Solicitudes Pendientes
          </h1>
          <span className="px-4 py-1.5 rounded-full bg-[#1A1FE8]/20 border border-[#1A1FE8] text-[#1A1FE8] font-bold text-lg shadow-[0_0_15px_rgba(26,31,232,0.3)]">
            {applications.length}
          </span>
        </div>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {applications.length === 0
            ? 'No hay solicitudes pendientes'
            : `${applications.length} ${applications.length === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}`
          }
        </p>
      </div>

      <div className="space-y-6">
        {applications.length === 0 ? (
          <div
            className={`rounded-2xl p-12 text-center border ${
              theme === 'dark'
                ? 'bg-[#0D0F2E]/50 backdrop-blur-xl border-blue-600/20'
                : 'bg-white border-gray-200'
            }`}
          >
            <CheckCircle className={`w-16 h-16 mx-auto mb-4 ${
              theme === 'dark' ? 'text-blue-500' : 'text-blue-700'
            }`} />
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              No hay solicitudes pendientes
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Todas las solicitudes han sido procesadas
            </p>
          </div>
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              className={`rounded-2xl p-6 border transition-all ${
                theme === 'dark'
                  ? 'bg-[#0D0F2E]/50 backdrop-blur-xl border-blue-600/20 shadow-[0_0_30px_rgba(26,31,232,0.1)]'
                  : 'bg-white border-gray-200 shadow-lg'
              }`}
            >
              {/* Header con información del solicitante */}
              <div className={`pb-4 mb-4 border-b ${
                theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'
              }`}>
                <h3 className={`text-xl font-bold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {app.firstName} {app.lastName}
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
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
              </div>

              {/* Revisiones de antecedentes */}
              <div className="space-y-4 mb-6">
                <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Revisión de Antecedentes
                </h4>
                {app.backgroundChecks.map((check) => (
                  <div
                    key={check.id}
                    className={`p-4 rounded-xl border ${
                      theme === 'dark'
                        ? 'bg-[#06071A]/50 border-blue-600/10'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      {/* Nombre y enlace */}
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {check.label}
                        </span>
                        <a
                          href={check.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#1A1FE8] hover:text-[#1217C8] transition-colors"
                        >
                          <span className="text-sm">Revisar</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      {/* Checkboxes de aprobación */}
                      <div className="flex gap-4">
                        <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition-all ${
                          check.approved === true
                            ? 'bg-green-500/20 border-2 border-green-500'
                            : theme === 'dark'
                            ? 'bg-[#0D0F2E]/50 border border-blue-600/10 hover:border-green-500/30'
                            : 'bg-white border border-gray-300 hover:border-green-500/50'
                        }`}>
                          <input
                            type="checkbox"
                            checked={check.approved === true}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleCheckChange(app.id, check.id, true);
                              }
                            }}
                            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                          />
                          <CheckCircle className={`w-5 h-5 ${
                            check.approved === true ? 'text-green-500' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm font-medium ${
                            check.approved === true
                              ? 'text-green-500'
                              : theme === 'dark'
                              ? 'text-gray-400'
                              : 'text-gray-600'
                          }`}>
                            Aprobado
                          </span>
                        </label>

                        <label className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg transition-all ${
                          check.approved === false
                            ? 'bg-red-500/20 border-2 border-red-500'
                            : theme === 'dark'
                            ? 'bg-[#0D0F2E]/50 border border-blue-600/10 hover:border-red-500/30'
                            : 'bg-white border border-gray-300 hover:border-red-500/50'
                        }`}>
                          <input
                            type="checkbox"
                            checked={check.approved === false}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleCheckChange(app.id, check.id, false);
                              }
                            }}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                          <XCircle className={`w-5 h-5 ${
                            check.approved === false ? 'text-red-500' : 'text-gray-400'
                          }`} />
                          <span className={`text-sm font-medium ${
                            check.approved === false
                              ? 'text-red-500'
                              : theme === 'dark'
                              ? 'text-gray-400'
                              : 'text-gray-600'
                          }`}>
                            No Aprobado
                          </span>
                        </label>
                      </div>

                      {/* Campo de comentarios si no está aprobado */}
                      {check.approved === false && (
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Razón del rechazo *
                          </label>
                          <textarea
                            value={check.comment}
                            onChange={(e) =>
                              handleCommentChange(app.id, check.id, e.target.value)
                            }
                            placeholder="Ingrese el motivo del rechazo..."
                            rows={3}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                              theme === 'dark'
                                ? 'bg-[#0D0F2E] border-blue-600/20 text-white placeholder-gray-500 focus:border-blue-600'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600'
                            } focus:outline-none focus:ring-2 focus:ring-blue-600/20`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón de enviar */}
              <button
                onClick={() => handleSubmit(app.id)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1FE8] text-white rounded-lg font-medium hover:bg-[#1217C8] transition-all shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)]"
              >
                <Send className="w-5 h-5" />
                Enviar Revisión
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
