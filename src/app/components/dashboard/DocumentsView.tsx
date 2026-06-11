import { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Book,
  FileCheck,
  ScrollText,
  Zap,
  Calendar,
  Shield,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface Document {
  id: string;
  title: string;
  description: string;
  icon: any;
  size: string;
  uploadDate: string;
  category: 'legal' | 'manual' | 'guide';
  signed?: boolean;
}

export function DocumentsView() {
  const { theme } = useTheme();

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const documents: Document[] = [
    {
      id: 'quick-guide',
      title: 'Guía de Uso Rápido',
      description: 'Instrucciones básicas para el uso diario de tu vehículo eléctrico',
      icon: Zap,
      size: '2.5 MB',
      uploadDate: '2026-01-15',
      category: 'guide',
    },
    {
      id: 'user-manual',
      title: 'Manual de Usuario del Vehículo',
      description: 'Manual completo del Nammi EV con especificaciones técnicas',
      icon: Book,
      size: '15.8 MB',
      uploadDate: '2026-01-15',
      category: 'manual',
    },
    {
      id: 'rights-duties',
      title: 'Carta de Derechos y Deberes',
      description: 'Documento firmado con tus derechos y obligaciones',
      icon: Shield,
      size: '1.2 MB',
      uploadDate: '2026-01-15',
      category: 'legal',
      signed: true,
    },
    {
      id: 'contract',
      title: 'Contrato Rent to Own',
      description: 'Contrato firmado del programa Rent to Own',
      icon: FileCheck,
      size: '3.7 MB',
      uploadDate: '2026-01-15',
      category: 'legal',
      signed: true,
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'legal':
        return 'blue';
      case 'manual':
        return 'blue';
      case 'guide':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'legal':
        return 'Legal';
      case 'manual':
        return 'Manual';
      case 'guide':
        return 'Guía';
      default:
        return 'Documento';
    }
  };

  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDownload = (doc: Document) => {
    console.log('Downloading:', doc.title);
    // Aquí iría la lógica real de descarga
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Documentos</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Accede a tus documentos importantes y manuales del vehículo
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Documentos</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{documents.length}</p>
        </div>

        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Documentos Firmados</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {documents.filter((d) => d.signed).length}
          </p>
        </div>

        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-700" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Última Actualización</span>
          </div>
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>15 Ene 2026</p>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {documents.map((doc) => {
          const Icon = doc.icon;
          const color = getCategoryColor(doc.category);

          return (
            <div
              key={doc.id}
              className={`rounded-2xl shadow-lg p-6 border hover:shadow-xl transition-all ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    color === 'blue'
                      ? 'bg-blue-100'
                      : color === 'blue'
                      ? 'bg-blue-100'
                      : color === 'green'
                      ? 'bg-green-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${
                      color === 'blue'
                        ? 'text-blue-600'
                        : color === 'blue'
                        ? 'text-blue-700'
                        : color === 'green'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{doc.title}</h3>
                    {doc.signed && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Firmado
                      </div>
                    )}
                  </div>
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{doc.description}</p>

                  <div className={`flex items-center gap-4 text-xs mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {doc.size}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {doc.uploadDate}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        color === 'blue'
                          ? 'bg-blue-100 text-blue-700'
                          : color === 'blue'
                          ? 'bg-blue-100 text-blue-800'
                          : color === 'green'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {getCategoryLabel(doc.category)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(doc)}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className={`flex-1 py-2 px-4 border-2 rounded-lg transition-colors font-semibold text-sm flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-blue-600/30 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <div
            className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E] border border-blue-600/20' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b transition-colors ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    getCategoryColor(selectedDocument.category) === 'blue'
                      ? 'bg-blue-100'
                      : getCategoryColor(selectedDocument.category) === 'blue'
                      ? 'bg-blue-100'
                      : 'bg-green-100'
                  }`}
                >
                  {selectedDocument.icon && (
                    <selectedDocument.icon
                      className={`w-5 h-5 ${
                        getCategoryColor(selectedDocument.category) === 'blue'
                          ? 'text-blue-600'
                          : getCategoryColor(selectedDocument.category) === 'blue'
                          ? 'text-blue-700'
                          : 'text-green-600'
                      }`}
                    />
                  )}
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedDocument.title}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedDocument.size}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
              >
                <span className={`text-2xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>×</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className={`rounded-xl p-8 min-h-[400px] transition-colors ${theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'}`}>
                {/* PDF Viewer Simulation */}
                <div className={`shadow-lg rounded-lg p-8 mb-4 transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]' : 'bg-white'}`}>
                  <div className={`flex items-center justify-between mb-6 pb-4 border-b transition-colors ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'}`}>
                    <div>
                      <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedDocument.title}
                      </h3>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>DriveOwn Rent to Own</p>
                    </div>
                    {selectedDocument.signed && (
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-green-600 font-semibold mb-1">
                          <CheckCircle className="w-5 h-5" />
                          Documento Firmado
                        </div>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Fecha: 15 Ene 2026</p>
                      </div>
                    )}
                  </div>

                  {selectedDocument.id === 'quick-guide' && (
                    <div className={`space-y-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <section>
                        <h4 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          🔋 Carga de tu Vehículo
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Mantén la carga entre 20% y 80% para máxima vida útil</li>
                          <li>• Usa carga lenta nocturna cuando sea posible</li>
                          <li>• Evita cargas rápidas frecuentes</li>
                          <li>• Carga completa solo antes de viajes largos</li>
                        </ul>
                      </section>

                      <section>
                        <h4 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          🚗 Conducción Eficiente
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Usa el modo Eco para maximizar autonomía</li>
                          <li>• Aprovecha la regeneración de frenado</li>
                          <li>• Mantén velocidad constante en carretera</li>
                          <li>• Precalienta/enfría mientras está conectado</li>
                        </ul>
                      </section>

                      <section>
                        <h4 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          🔧 Mantenimiento Básico
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Revisa presión de llantas cada 2 semanas</li>
                          <li>• Mantenimiento cada 10,000 km</li>
                          <li>• Limpia los sensores regularmente</li>
                          <li>• Verifica líquido de frenos cada 6 meses</li>
                        </ul>
                      </section>
                    </div>
                  )}

                  {selectedDocument.id === 'user-manual' && (
                    <div className={`space-y-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <section>
                        <h4 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          📋 Especificaciones Técnicas
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Modelo</p>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Nammi EV 2026</p>
                          </div>
                          <div>
                            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Batería</p>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>60 kWh</p>
                          </div>
                          <div>
                            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Autonomía</p>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>360 km</p>
                          </div>
                          <div>
                            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Potencia</p>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>150 kW (204 HP)</p>
                          </div>
                          <div>
                            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Velocidad Máxima</p>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>160 km/h</p>
                          </div>
                          <div>
                            <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>0-100 km/h</p>
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>7.5 segundos</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h4 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ⚡ Tiempos de Carga
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Carga Rápida DC (50kW): 40 min (20-80%)</li>
                          <li>• Carga AC Nivel 2 (7.4kW): 8 horas (completa)</li>
                          <li>• Carga AC Doméstica (2.3kW): 26 horas (completa)</li>
                        </ul>
                      </section>
                    </div>
                  )}

                  {selectedDocument.id === 'rights-duties' && (
                    <div className={`space-y-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <section>
                        <h4 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ✅ Tus Derechos
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Uso completo del vehículo durante el período del contrato</li>
                          <li>• Soporte técnico 24/7 incluido</li>
                          <li>• Opción de compra anticipada sin penalización</li>
                          <li>• Cobertura de seguro incluida en la cuota semanal</li>
                          <li>• Mantenimiento preventivo sin costo adicional</li>
                        </ul>
                      </section>

                      <section>
                        <h4 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          📝 Tus Deberes
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>• Pago puntual de la cuota semanal</li>
                          <li>• Mantenimiento adecuado del vehículo</li>
                          <li>• Uso responsable y legal del vehículo</li>
                          <li>• Reporte inmediato de daños o accidentes</li>
                          <li>• Mantener documentos y seguros vigentes</li>
                        </ul>
                      </section>

                      <div className={`mt-6 pt-6 border-t transition-colors ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'}`}>
                        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <strong>Firma Digital:</strong> Juan Pérez
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <strong>Fecha:</strong> 15 de Enero, 2026
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedDocument.id === 'contract' && (
                    <div className={`space-y-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      <section>
                        <h4 className={`font-bold text-lg mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Contrato Rent to Own
                        </h4>
                        <p className="text-sm mb-4">
                          Entre <strong>DriveOwn S.A.S.</strong> (El Arrendador) y{' '}
                          <strong>Juan Pérez</strong> (El Arrendatario)
                        </p>
                      </section>

                      <section>
                        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1. Objeto del Contrato</h4>
                        <p className="text-sm">
                          Arrendamiento con opción de compra de vehículo eléctrico Nammi EV
                          2026, VIN: LNBM2EV3XN1234567
                        </p>
                      </section>

                      <section>
                        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>2. Términos Financieros</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Cuota semanal: $207,000 COP</li>
                          <li>• Plazo: 60 meses (260 semanas)</li>
                          <li>• Valor total: $25,000,000 COP</li>
                          <li>• Monto pagado a la fecha: $15,000,000 COP</li>
                        </ul>
                      </section>

                      <section>
                        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>3. Opción de Compra</h4>
                        <p className="text-sm">
                          Al completar el 100% de los pagos, el arrendatario adquiere
                          automáticamente la propiedad total del vehículo sin costos
                          adicionales.
                        </p>
                      </section>

                      <div className={`mt-6 pt-6 border-t space-y-4 transition-colors ${theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'}`}>
                        <div>
                          <p className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Firma del Arrendatario:</p>
                          <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Juan Pérez</p>
                        </div>
                        <div>
                          <p className={`text-sm font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Firma de DriveOwn:</p>
                          <p className={`text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>María González - CEO</p>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          <strong>Fecha de firma:</strong> 15 de Enero, 2026
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-end gap-3 p-6 border-t transition-colors ${theme === 'dark' ? 'border-blue-600/20 bg-[#06071A]' : 'border-gray-200 bg-gray-50'}`}>
              <button
                onClick={() => setSelectedDocument(null)}
                className={`px-6 py-2 border-2 rounded-lg transition-colors font-semibold ${theme === 'dark' ? 'border-blue-600/30 text-gray-300 hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                Cerrar
              </button>
              <button
                onClick={() => handleDownload(selectedDocument)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              📄 Sobre tus Documentos
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Todos tus documentos están disponibles 24/7</li>
              <li>• Puedes descargarlos en formato PDF cuando lo necesites</li>
              <li>• Los documentos firmados tienen validez legal</li>
              <li>• Conserva copias de seguridad de documentos importantes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
