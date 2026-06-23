import { Building2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { PersistedFileUpload } from './PersistedFileUpload';
import { useApplicationUploads } from '../../hooks/useApplicationUploads';
import type { UserDocumentMeta } from '../../../lib/documentsApi';

interface BankingDocumentsStepProps {
  userId: string;
  documents: Record<string, UserDocumentMeta>;
  onDocumentUploaded: (doc: UserDocumentMeta) => void;
  onNext: () => void;
  onBack: () => void;
}

export function BankingDocumentsStep({
  userId,
  documents,
  onDocumentUploaded,
  onNext,
  onBack,
}: BankingDocumentsStepProps) {
  const { theme } = useTheme();
  const { upload, isUploading, getError } = useApplicationUploads(userId, onDocumentUploaded);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1FE8]/20 border-2 border-[#1A1FE8] mb-4 shadow-[0_0_20px_rgba(26,31,232,0.3)]">
          <Building2 className="w-8 h-8 text-[#1A1FE8]" />
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Información Bancaria
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Necesitamos validar tu historial financiero y capacidad de pago
        </p>
      </div>

      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Extracto Bancario
        </h3>
        <PersistedFileUpload
          id="bank-statement"
          label="Extracto bancario de los últimos 3 meses"
          icon={Building2}
          accept="image/*,.pdf"
          saved={documents.bankDocument}
          uploading={isUploading('bankDocument')}
          error={getError('bankDocument')}
          onFileSelected={(file) => upload('bankDocument', file)}
        />
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          📄 Descarga el extracto desde la app o portal web de tu banco
        </p>
      </div>

      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Historial Crediticio
        </h3>
        <PersistedFileUpload
          id="credit-history"
          label="Consulta de DataCrédito o centrales de riesgo"
          icon={Building2}
          accept="image/*,.pdf"
          saved={documents.creditReport}
          uploading={isUploading('creditReport')}
          error={getError('creditReport')}
          onFileSelected={(file) => upload('creditReport', file)}
        />
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          💳 Puedes obtenerlo gratis en www.midatacrédito.com
        </p>
      </div>

      <div
        className={`p-6 rounded-xl border ${
          theme === 'dark' ? 'bg-blue-600/10 border-blue-600/30' : 'bg-blue-50 border-blue-200'
        }`}
      >
        <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-950'}`}>
          ¿Por qué necesitamos esta información?
        </h4>
        <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>
          <li>• Evaluar tu capacidad de pago para los $207,000 COP semanales</li>
          <li>• Verificar tu historial financiero y comportamiento de pago</li>
          <li>• Cumplir con las regulaciones financieras vigentes</li>
          <li>• Ofrecerte las mejores condiciones según tu perfil</li>
        </ul>
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
