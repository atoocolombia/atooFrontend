import { Home, Smartphone } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { PersistedFileUpload } from './PersistedFileUpload';
import { useApplicationUploads } from '../../hooks/useApplicationUploads';
import type { UserDocumentMeta } from '../../../lib/documentsApi';

interface ResidenceAndAppsStepProps {
  userId: string;
  documents: Record<string, UserDocumentMeta>;
  onDocumentUploaded: (doc: UserDocumentMeta) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ResidenceAndAppsStep({
  userId,
  documents,
  onDocumentUploaded,
  onNext,
  onBack,
}: ResidenceAndAppsStepProps) {
  const { theme } = useTheme();
  const { upload, isUploading, getError } = useApplicationUploads(userId, onDocumentUploaded);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1FE8]/20 border-2 border-[#1A1FE8] mb-4 shadow-[0_0_20px_rgba(26,31,232,0.3)]">
          <Home className="w-8 h-8 text-[#1A1FE8]" />
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Comprobante de Domicilio y Experiencia
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Verificamos tu lugar de residencia y tu experiencia en plataformas de movilidad
        </p>
      </div>

      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Comprobante de Domicilio
        </h3>
        <PersistedFileUpload
          id="utility-bill"
          label="Recibo de servicio público (Agua, Luz o Gas)"
          icon={Home}
          accept="image/*,.pdf"
          required
          saved={documents.utilityAddressReceipt}
          uploading={isUploading('utilityAddressReceipt')}
          error={getError('utilityAddressReceipt')}
          onFileSelected={(file) => upload('utilityAddressReceipt', file)}
        />
        <div
          className={`mt-4 p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-blue-600/10 border-blue-600/30' : 'bg-blue-50 border-blue-200'
          }`}
        >
          <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
            Requisitos del recibo:
          </h4>
          <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
            <li>• El recibo debe estar a tu nombre o del propietario del inmueble</li>
            <li>• Debe tener fecha de emisión no mayor a 3 meses</li>
            <li>• Debe incluir dirección completa legible</li>
          </ul>
        </div>
      </div>

      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Perfiles de Aplicaciones de Movilidad
        </h3>
        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Sube capturas de pantalla de tus perfiles en las aplicaciones donde has trabajado (opcional pero recomendado)
        </p>

        <div className="space-y-4">
          <PersistedFileUpload
            id="app-profile-1"
            label="Aplicación 1 (Ej: Uber, DiDi, Beat)"
            icon={Smartphone}
            accept="image/*,.pdf"
            saved={documents.platformWork1}
            uploading={isUploading('platformWork1')}
            error={getError('platformWork1')}
            onFileSelected={(file) => upload('platformWork1', file)}
          />
          <PersistedFileUpload
            id="app-profile-2"
            label="Aplicación 2 (Opcional)"
            icon={Smartphone}
            accept="image/*,.pdf"
            saved={documents.platformWork2}
            uploading={isUploading('platformWork2')}
            error={getError('platformWork2')}
            onFileSelected={(file) => upload('platformWork2', file)}
          />
          <PersistedFileUpload
            id="app-profile-3"
            label="Aplicación 3 (Opcional)"
            icon={Smartphone}
            accept="image/*,.pdf"
            saved={documents.platformWork3}
            uploading={isUploading('platformWork3')}
            error={getError('platformWork3')}
            onFileSelected={(file) => upload('platformWork3', file)}
          />
        </div>

        <div
          className={`mt-4 p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
          }`}
        >
          <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
            💡 <strong>Tip:</strong> Si incluyes tus perfiles de aplicaciones con buenas calificaciones, acelerarás tu
            proceso de aprobación
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            theme === 'dark'
              ? 'bg-white/5 text-gray-300 hover:bg-white/10'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Volver
        </button>
        <button
          onClick={onNext}
          className="px-8 py-3 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)]"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
