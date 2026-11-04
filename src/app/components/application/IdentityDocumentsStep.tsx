import { useEffect, useRef, useState } from 'react';
import { CreditCard, Camera } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { PersistedFileUpload } from './PersistedFileUpload';
import { useApplicationUploads } from '../../hooks/useApplicationUploads';
import type { UserDocumentMeta } from '../../../lib/documentsApi';
import {
  inferIdUploadMode,
  inferLicenseUploadMode,
  isIdentityStepComplete,
} from '../../../lib/applicationProgress';

interface IdentityDocumentsStepProps {
  userId: string;
  documents: Record<string, UserDocumentMeta>;
  onDocumentUploaded: (doc: UserDocumentMeta) => void;
  onNext: () => void;
  onBack: () => void;
}

type UploadMode = 'separate' | 'combined';

/** Fotos o PDF (escaneo); igual que otros pasos de la solicitud. */
const DOCUMENT_IMAGE_OR_PDF_ACCEPT = 'image/*,.pdf,application/pdf';
const SELFIE_ACCEPT = 'image/*';

function ModeToggle({
  mode,
  onChange,
  separateLabel,
  combinedLabel,
}: {
  mode: UploadMode;
  onChange: (mode: UploadMode) => void;
  separateLabel: string;
  combinedLabel: string;
}) {
  const { theme } = useTheme();
  const base =
    theme === 'dark'
      ? 'border-blue-600/30 bg-[#06071A]/80 text-gray-300'
      : 'border-gray-200 bg-white text-gray-700';
  const active =
    theme === 'dark'
      ? 'border-[#1A1FE8] bg-[#1A1FE8]/20 text-white'
      : 'border-[#1A1FE8] bg-blue-50 text-[#1A1FE8]';

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <button
        type="button"
        onClick={() => onChange('separate')}
        className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${mode === 'separate' ? active : base}`}
      >
        {separateLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('combined')}
        className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left ${mode === 'combined' ? active : base}`}
      >
        {combinedLabel}
      </button>
    </div>
  );
}

export function IdentityDocumentsStep({
  userId,
  documents,
  onDocumentUploaded,
  onNext,
  onBack,
}: IdentityDocumentsStepProps) {
  const { theme } = useTheme();

  const [idMode, setIdMode] = useState<UploadMode>(() => inferIdUploadMode(documents));
  const [licenseMode, setLicenseMode] = useState<UploadMode>(() => inferLicenseUploadMode(documents));
  const inferredModeFromServer = useRef(false);

  /** Solo al cargar documentos del servidor; no pisar si el usuario eligió «un solo archivo». */
  useEffect(() => {
    if (inferredModeFromServer.current) return;
    const hasAny =
      documents.idFront ||
      documents.idBack ||
      documents.idBothSides ||
      documents.licenseFront ||
      documents.licenseBack ||
      documents.licenseBothSides;
    if (!hasAny) return;
    setIdMode(inferIdUploadMode(documents));
    setLicenseMode(inferLicenseUploadMode(documents));
    inferredModeFromServer.current = true;
  }, [
    documents.idBothSides,
    documents.idFront,
    documents.idBack,
    documents.licenseBothSides,
    documents.licenseFront,
    documents.licenseBack,
  ]);

  const handleDocumentUploaded = (doc: UserDocumentMeta) => {
    if (doc.documentKind === 'idBothSides') setIdMode('combined');
    if (doc.documentKind === 'licenseBothSides') setLicenseMode('combined');
    if ((doc.documentKind === 'idFront' || doc.documentKind === 'idBack') && !documents.idBothSides) {
      setIdMode('separate');
    }
    if (doc.documentKind === 'licenseFront' || doc.documentKind === 'licenseBack') {
      if (!documents.licenseBothSides) setLicenseMode('separate');
    }
    onDocumentUploaded(doc);
  };

  const { upload, isUploading, getError } = useApplicationUploads(userId, handleDocumentUploaded);

  const stepComplete = isIdentityStepComplete(documents);

  const anyUploadInProgress =
    isUploading('idFront') ||
    isUploading('idBack') ||
    isUploading('idBothSides') ||
    isUploading('licenseFront') ||
    isUploading('licenseBack') ||
    isUploading('licenseBothSides') ||
    isUploading('selfieWhiteBackground');

  const canContinue = stepComplete && !anyUploadInProgress;

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
        <ModeToggle
          mode={idMode}
          onChange={setIdMode}
          separateLabel="Frente y reverso por separado (foto o archivo)"
          combinedLabel="Un solo archivo con frente y reverso (foto, PDF o escaneo)"
        />
        {idMode === 'separate' ? (
          <div className="grid md:grid-cols-2 gap-4">
            <PersistedFileUpload
              id="id-front"
              label="Frente del documento"
              icon={CreditCard}
              accept={DOCUMENT_IMAGE_OR_PDF_ACCEPT}
              saved={documents.idFront}
              uploading={isUploading('idFront')}
              error={getError('idFront')}
              onFileSelected={(file) => upload('idFront', file)}
            />
            <PersistedFileUpload
              id="id-back"
              label="Reverso del documento"
              icon={CreditCard}
              accept={DOCUMENT_IMAGE_OR_PDF_ACCEPT}
              saved={documents.idBack}
              uploading={isUploading('idBack')}
              error={getError('idBack')}
              onFileSelected={(file) => upload('idBack', file)}
            />
          </div>
        ) : (
          <PersistedFileUpload
            id="id-both"
            label="Cédula o pasaporte (frente y reverso)"
            icon={CreditCard}
            accept={DOCUMENT_IMAGE_OR_PDF_ACCEPT}
            saved={documents.idBothSides}
            uploading={isUploading('idBothSides')}
            error={getError('idBothSides')}
            onFileSelected={(file) => upload('idBothSides', file)}
          />
        )}
        <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          Aceptamos cédula colombiana, cédula venezolana o pasaporte. Puedes tomar fotos por cara o subir un
          documento donde se vean las dos.
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
        <ModeToggle
          mode={licenseMode}
          onChange={setLicenseMode}
          separateLabel="Frente y reverso por separado"
          combinedLabel="Un archivo con frente y reverso del pase"
        />
        {licenseMode === 'separate' ? (
          <div className="grid md:grid-cols-2 gap-4">
            <PersistedFileUpload
              id="license-front"
              label="Frente de la licencia"
              icon={CreditCard}
              accept={DOCUMENT_IMAGE_OR_PDF_ACCEPT}
              saved={documents.licenseFront}
              uploading={isUploading('licenseFront')}
              error={getError('licenseFront')}
              onFileSelected={(file) => upload('licenseFront', file)}
            />
            <PersistedFileUpload
              id="license-back"
              label="Reverso de la licencia"
              icon={CreditCard}
              accept={DOCUMENT_IMAGE_OR_PDF_ACCEPT}
              saved={documents.licenseBack}
              uploading={isUploading('licenseBack')}
              error={getError('licenseBack')}
              onFileSelected={(file) => upload('licenseBack', file)}
            />
          </div>
        ) : (
          <PersistedFileUpload
            id="license-both"
            label="Licencia colombiana (frente y reverso)"
            icon={CreditCard}
            accept={DOCUMENT_IMAGE_OR_PDF_ACCEPT}
            saved={documents.licenseBothSides}
            uploading={isUploading('licenseBothSides')}
            error={getError('licenseBothSides')}
            onFileSelected={(file) => upload('licenseBothSides', file)}
          />
        )}
        <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          Licencia de conducción colombiana: datos alineados con tu identidad y categoría B1, B2 o B3 vigente en
          el reverso. Comparamos las fotos con tu cédula y selfie.
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
          accept={SELFIE_ACCEPT}
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
          type="button"
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
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          title={
            !stepComplete
              ? 'Valida identidad, licencia y selfie (por separado o en un archivo con ambas caras)'
              : undefined
          }
          className="px-8 py-3 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_20px_rgba(26,31,232,0.3)]"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
