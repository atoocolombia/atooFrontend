import { CreditCard, Camera } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { PersistedFileUpload } from './PersistedFileUpload';
import { useApplicationUploads } from '../../hooks/useApplicationUploads';
import type { UserDocumentMeta } from '../../../lib/documentsApi';

interface IdentityDocumentsStepProps {
  userId: string;
  documents: Record<string, UserDocumentMeta>;
  onDocumentUploaded: (doc: UserDocumentMeta) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IdentityDocumentsStep({
  userId,
  documents,
  onDocumentUploaded,
  onNext,
  onBack,
}: IdentityDocumentsStepProps) {
  const { theme } = useTheme();
  const { upload, isUploading, getError } = useApplicationUploads(userId, onDocumentUploaded);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1FE8]/20 border-2 border-[#1A1FE8] mb-4 shadow-[0_0_20px_rgba(26,31,232,0.3)]">
          <CreditCard className="w-8 h-8 text-[#1A1FE8]" />
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Documentos de Identidad
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Necesitamos verificar tu identidad y licencia de conducción
        </p>
      </div>

      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Documento de Identidad
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <PersistedFileUpload
            id="id-front"
            label="Frente del documento"
            icon={CreditCard}
            saved={documents.idFront}
            uploading={isUploading('idFront')}
            error={getError('idFront')}
            onFileSelected={(file) => upload('idFront', file)}
          />
          <PersistedFileUpload
            id="id-back"
            label="Reverso del documento"
            icon={CreditCard}
            saved={documents.idBack}
            uploading={isUploading('idBack')}
            error={getError('idBack')}
            onFileSelected={(file) => upload('idBack', file)}
          />
        </div>
        <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          💡 Asegúrate de que los datos sean legibles y la foto esté completa
        </p>
      </div>

      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Licencia de Conducción
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <PersistedFileUpload
            id="license-front"
            label="Frente de la licencia"
            icon={CreditCard}
            saved={documents.licenseFront}
            uploading={isUploading('licenseFront')}
            error={getError('licenseFront')}
            onFileSelected={(file) => upload('licenseFront', file)}
          />
          <PersistedFileUpload
            id="license-back"
            label="Reverso de la licencia"
            icon={CreditCard}
            saved={documents.licenseBack}
            uploading={isUploading('licenseBack')}
            error={getError('licenseBack')}
            onFileSelected={(file) => upload('licenseBack', file)}
          />
        </div>
        <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          💡 Verifica que tu licencia esté vigente y sea categoría B1 o superior
        </p>
      </div>

      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Foto de Rostro
        </h3>
        <PersistedFileUpload
          id="face-photo"
          label="Foto con buena iluminación"
          icon={Camera}
          saved={documents.selfieWhiteBackground}
          uploading={isUploading('selfieWhiteBackground')}
          error={getError('selfieWhiteBackground')}
          onFileSelected={(file) => upload('selfieWhiteBackground', file)}
        />
        <div
          className={`mt-4 p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-blue-600/10 border-blue-600/30' : 'bg-blue-50 border-blue-200'
          }`}
        >
          <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
            Recomendaciones para la foto:
          </h4>
          <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
            <li>• Asegúrate de tener buena iluminación natural o artificial</li>
            <li>• Tu rostro debe estar completamente visible</li>
            <li>• No uses gafas oscuras ni gorras</li>
            <li>• Mira directamente a la cámara</li>
          </ul>
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
