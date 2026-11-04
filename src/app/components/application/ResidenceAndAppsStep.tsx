import { useCallback, useEffect, useState } from 'react';
import { Home, Smartphone } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { PersistedFileUpload } from './PersistedFileUpload';
import { useApplicationUploads } from '../../hooks/useApplicationUploads';
import {
  fetchWorkAddressStepMeta,
  patchWorkAddressStepMeta,
  type UserDocumentMeta,
  type WorkAddressStepMeta,
} from '../../../lib/documentsApi';
import { isResidenceStepComplete } from '../../../lib/applicationProgress';
import {
  isPlatformAttachmentKind,
  MAX_PLATFORM_PHOTO_INDEX_PER_SLOT,
  pdfKindForSlot,
  photoIndicesUsedInDocuments,
  photoKindForSlotIndex,
  PLATFORM_MOBILITY_MULTI_APP_PDF,
  videoKindForSlot,
  type PlatformUiSlot,
} from '../../../lib/platformPhotoKinds';

interface ResidenceAndAppsStepProps {
  userId: string;
  documents: Record<string, UserDocumentMeta>;
  onDocumentUploaded: (doc: UserDocumentMeta) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_META: WorkAddressStepMeta = {
  mobilityDrivenElectricVehicle: null,
  mobilityElectricExperienceText: null,
  platformSlot1Complete: false,
  platformSlot2Complete: false,
  platformSlot3Complete: false,
  platformSlots: {
    '1': { complete: false, missing: [] },
    '2': { complete: false, missing: [] },
    '3': { complete: false, missing: [] },
  },
};

function PlatformMobilitySlot({
  slot,
  title,
  required,
  documents,
  slotMeta,
  mobilityElectric,
  isUploading,
  getError,
  onUpload,
  theme,
}: {
  slot: PlatformUiSlot;
  title: string;
  required?: boolean;
  documents: Record<string, UserDocumentMeta>;
  slotMeta: WorkAddressStepMeta['platformSlots']['1'];
  mobilityElectric: boolean | null;
  isUploading: (kind: string) => boolean;
  getError: (kind: string) => string | null;
  onUpload: (kind: string, file: File) => void;
  theme: string;
}) {
  const slotKey = String(slot) as '1' | '2' | '3';
  const usedIndices = photoIndicesUsedInDocuments(documents, slot);
  const maxUsedIndex = usedIndices.length > 0 ? Math.max(...usedIndices) : 0;

  const [photoRowCount, setPhotoRowCount] = useState(() => (required ? 1 : 0));

  useEffect(() => {
    if (maxUsedIndex === 0) {
      if (required) setPhotoRowCount((c) => Math.max(c, 1));
      return;
    }
    const lastKind = photoKindForSlotIndex(slot, maxUsedIndex);
    const addEmptyRow = Boolean(documents[lastKind]);
    setPhotoRowCount((c) => {
      const min = Math.max(c, maxUsedIndex, addEmptyRow ? maxUsedIndex + 1 : maxUsedIndex);
      return Math.min(MAX_PLATFORM_PHOTO_INDEX_PER_SLOT, min);
    });
  }, [documents, slot, maxUsedIndex, required]);

  const showMediaExtras =
    photoRowCount > 0 ||
    Boolean(documents[videoKindForSlot(slot)]) ||
    Boolean(documents[pdfKindForSlot(slot)]);

  const photoIndices = Array.from({ length: photoRowCount }, (_, i) => i + 1);

  return (
    <div
      className={`rounded-lg border p-4 ${
        theme === 'dark' ? 'border-blue-600/20 bg-[#06071A]/30' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title} {required && <span className="text-red-500">*</span>}
        </h4>
        {slotMeta.complete ? (
          <span className="text-xs font-medium text-green-600">Perfil completo</span>
        ) : (
          <span className="text-xs font-medium text-amber-600">Faltan datos — sube más capturas</span>
        )}
      </div>
      <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        Agrega las capturas que necesites (imagen o PDF por archivo), opcionalmente un video o un PDF de la app. Los
        datos pueden estar en archivos distintos.
      </p>

      {photoRowCount === 0 && !required && (
        <button
          type="button"
          onClick={() => setPhotoRowCount(1)}
          className="mb-3 text-sm font-semibold text-[#1A1FE8] hover:underline"
        >
          + Agregar capturas de esta app
        </button>
      )}

      <div className="space-y-3">
        {photoIndices.map((index) => {
          const kind = photoKindForSlotIndex(slot, index);
          return (
            <PersistedFileUpload
              key={kind}
              id={`${slotKey}-photo-${index}`}
              label={index === 1 ? 'Captura 1' : `Captura ${index}`}
              icon={Smartphone}
              accept="image/*,.pdf"
              required={required && index === 1}
              saved={documents[kind]}
              uploading={isUploading(kind)}
              error={getError(kind)}
              onFileSelected={(file) => onUpload(kind, file)}
            />
          );
        })}

        {photoRowCount > 0 && photoRowCount < MAX_PLATFORM_PHOTO_INDEX_PER_SLOT && (
          <button
            type="button"
            onClick={() => setPhotoRowCount((c) => Math.min(MAX_PLATFORM_PHOTO_INDEX_PER_SLOT, c + 1))}
            className="text-sm font-semibold text-[#1A1FE8] hover:underline"
          >
            + Agregar otra captura
          </button>
        )}

        {showMediaExtras && (
          <>
            <PersistedFileUpload
              id={`${slotKey}-video`}
              label="Video de pantallas (opcional)"
              icon={Smartphone}
              accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm"
              saved={documents[videoKindForSlot(slot)]}
              uploading={isUploading(videoKindForSlot(slot))}
              error={getError(videoKindForSlot(slot))}
              onFileSelected={(file) => onUpload(videoKindForSlot(slot), file)}
            />
            <PersistedFileUpload
              id={`${slotKey}-pdf`}
              label="PDF de esta app (opcional)"
              icon={Smartphone}
              accept=".pdf,application/pdf"
              saved={documents[pdfKindForSlot(slot)]}
              uploading={isUploading(pdfKindForSlot(slot))}
              error={getError(pdfKindForSlot(slot))}
              onFileSelected={(file) => onUpload(pdfKindForSlot(slot), file)}
            />
          </>
        )}
      </div>
      {!slotMeta.complete && slotMeta.missing.length > 0 && mobilityElectric !== null && (
        <p className={`text-xs mt-3 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-800'}`}>
          Aún necesitamos en conjunto: {slotMeta.missing.join('; ')}.
        </p>
      )}
    </div>
  );
}

export function ResidenceAndAppsStep({
  userId,
  documents,
  onDocumentUploaded,
  onNext,
  onBack,
}: ResidenceAndAppsStepProps) {
  const { theme } = useTheme();
  const [mobilityElectric, setMobilityElectric] = useState<boolean | null>(null);
  const [electricExperience, setElectricExperience] = useState('');
  const [mobilityChoiceError, setMobilityChoiceError] = useState<string | null>(null);
  const [electricExperienceError, setElectricExperienceError] = useState<string | null>(null);
  const [stepMeta, setStepMeta] = useState<WorkAddressStepMeta>(DEFAULT_META);

  const refreshMeta = useCallback(async () => {
    try {
      const meta = await fetchWorkAddressStepMeta(userId);
      setStepMeta(meta);
      if (meta.mobilityDrivenElectricVehicle !== null) {
        setMobilityElectric(meta.mobilityDrivenElectricVehicle);
      }
      if (meta.mobilityElectricExperienceText) {
        setElectricExperience(meta.mobilityElectricExperienceText);
      } else if (meta.mobilityDrivenElectricVehicle === false) {
        setElectricExperience('');
      }
    } catch {
      /* ignore */
    }
  }, [userId]);

  useEffect(() => {
    refreshMeta();
  }, [refreshMeta]);

  const handleDocumentUploaded = useCallback(
    (doc: UserDocumentMeta) => {
      onDocumentUploaded(doc);
      if (isPlatformAttachmentKind(doc.documentKind)) {
        void refreshMeta();
      }
    },
    [onDocumentUploaded, refreshMeta],
  );

  const getUploadOptions = useCallback(
    (documentKind: string) => {
      if (!isPlatformAttachmentKind(documentKind)) {
        return undefined;
      }
      if (mobilityElectric === null) {
        return undefined;
      }
      return { mobilityElectricVehicle: mobilityElectric };
    },
    [mobilityElectric],
  );

  const { upload, isUploading, getError } = useApplicationUploads(
    userId,
    handleDocumentUploaded,
    getUploadOptions,
  );

  const setElectricChoice = async (value: boolean) => {
    setMobilityChoiceError(null);
    setElectricExperienceError(null);
    setMobilityElectric(value);
    if (!value) {
      setElectricExperience('');
    }
    try {
      const meta = await patchWorkAddressStepMeta(userId, { mobilityDrivenElectricVehicle: value });
      setStepMeta(meta);
    } catch {
      setMobilityChoiceError('No pudimos guardar tu respuesta. Inténtalo de nuevo.');
    }
  };

  const saveElectricExperience = async () => {
    setElectricExperienceError(null);
    const trimmed = electricExperience.trim();
    if (!trimmed) {
      setElectricExperienceError('Indica cuánto tiempo de experiencia tienes (por ejemplo: 6 meses o 2 años).');
      return;
    }
    try {
      const meta = await patchWorkAddressStepMeta(userId, {
        mobilityElectricExperienceText: trimmed,
      });
      setStepMeta(meta);
      setElectricExperience(meta.mobilityElectricExperienceText ?? trimmed);
    } catch {
      setElectricExperienceError('No pudimos guardar tu respuesta. Inténtalo de nuevo.');
    }
  };

  const electricDeclarationReady =
    mobilityElectric === false ||
    (mobilityElectric === true &&
      Boolean(stepMeta.mobilityElectricExperienceText?.trim() || electricExperience.trim()));

  const uploadPlatform = (kind: string, file: File) => {
    if (mobilityElectric === null) {
      setMobilityChoiceError(
        'Indica primero si has conducido vehículo eléctrico en alguna app de movilidad.',
      );
      return;
    }
    if (mobilityElectric === true && !electricDeclarationReady) {
      setElectricExperienceError(
        'Indica cuánto tiempo de experiencia tienes conduciendo vehículo eléctrico.',
      );
      return;
    }
    setMobilityChoiceError(null);
    setElectricExperienceError(null);
    upload(kind, file);
  };

  const canContinue =
    isResidenceStepComplete(documents, stepMeta) &&
    mobilityElectric !== null &&
    electricDeclarationReady;

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
            <li>• Debe estar a tu nombre, igual que en tu documento de identidad</li>
            <li>• Fecha de emisión no mayor a 3 meses</li>
            <li>• Dirección completa legible; si es apartamento, debe verse torre, apto o complemento</li>
            <li>• Si es casa, incluye el complemento que identifique la vivienda cuando aparezca en el recibo</li>
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

        <div className="mb-6">
          <p className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            ¿Has conducido vehículo eléctrico en alguna app de movilidad? <span className="text-red-400">*</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setElectricChoice(true)}
              className={`px-5 py-2.5 rounded-lg font-semibold border transition-colors ${
                mobilityElectric === true
                  ? 'bg-[#1A1FE8] text-white border-[#1A1FE8]'
                  : theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:border-[#1A1FE8]'
                    : 'border-gray-300 text-gray-700 hover:border-[#1A1FE8]'
              }`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setElectricChoice(false)}
              className={`px-5 py-2.5 rounded-lg font-semibold border transition-colors ${
                mobilityElectric === false
                  ? 'bg-[#1A1FE8] text-white border-[#1A1FE8]'
                  : theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:border-[#1A1FE8]'
                    : 'border-gray-300 text-gray-700 hover:border-[#1A1FE8]'
              }`}
            >
              No
            </button>
          </div>
          {mobilityChoiceError && (
            <p className="mt-2 text-sm text-red-400">{mobilityChoiceError}</p>
          )}

          {mobilityElectric === true && (
            <div className="mt-4">
              <label
                htmlFor="electric-experience"
                className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                ¿Cuánto tiempo de experiencia tienes conduciendo vehículo eléctrico?{' '}
                <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="electric-experience"
                  type="text"
                  maxLength={120}
                  value={electricExperience}
                  onChange={(e) => setElectricExperience(e.target.value)}
                  onBlur={() => {
                    if (electricExperience.trim()) void saveElectricExperience();
                  }}
                  placeholder="Ej: 8 meses, 1 año, 3 años"
                  className={`flex-1 px-4 py-2.5 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-[#06071A] border-gray-600 text-white placeholder:text-gray-500'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => void saveElectricExperience()}
                  className="px-5 py-2.5 rounded-lg font-semibold bg-[#1A1FE8] text-white hover:bg-[#1217C8] transition-colors shrink-0"
                >
                  Guardar
                </button>
              </div>
              {electricExperienceError && (
                <p className="mt-2 text-sm text-red-400">{electricExperienceError}</p>
              )}
              {stepMeta.mobilityElectricExperienceText && (
                <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                  Guardado: {stepMeta.mobilityElectricExperienceText}
                </p>
              )}
            </div>
          )}
        </div>

        <div
          className={`mb-6 rounded-lg border p-4 ${
            theme === 'dark' ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-200 bg-purple-50/50'
          }`}
        >
          <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            PDF con varias apps (opcional)
          </h4>
          <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Un solo PDF puede incluir capturas de <strong>varias plataformas</strong>; las asignamos a Plataforma 1, 2 o
            3 según lo que se distinga en el documento.
          </p>
          <PersistedFileUpload
            id="platform-multi-app-pdf"
            label="PDF multi-app"
            icon={Smartphone}
            accept=".pdf,application/pdf"
            saved={documents[PLATFORM_MOBILITY_MULTI_APP_PDF]}
            uploading={isUploading(PLATFORM_MOBILITY_MULTI_APP_PDF)}
            error={getError(PLATFORM_MOBILITY_MULTI_APP_PDF)}
            onFileSelected={(file) => uploadPlatform(PLATFORM_MOBILITY_MULTI_APP_PDF, file)}
          />
        </div>

        <div className="space-y-4">
          <PlatformMobilitySlot
            slot={1}
            title="Plataforma 1 (Ej: Uber, DiDi, Beat)"
            required
            documents={documents}
            slotMeta={stepMeta.platformSlots['1']}
            mobilityElectric={mobilityElectric}
            isUploading={isUploading}
            getError={getError}
            onUpload={uploadPlatform}
            theme={theme}
          />
          <PlatformMobilitySlot
            slot={2}
            title="Plataforma 2 (Opcional)"
            documents={documents}
            slotMeta={stepMeta.platformSlots['2']}
            mobilityElectric={mobilityElectric}
            isUploading={isUploading}
            getError={getError}
            onUpload={uploadPlatform}
            theme={theme}
          />
          <PlatformMobilitySlot
            slot={3}
            title="Plataforma 3 (Opcional)"
            documents={documents}
            slotMeta={stepMeta.platformSlots['3']}
            mobilityElectric={mobilityElectric}
            isUploading={isUploading}
            getError={getError}
            onUpload={uploadPlatform}
            theme={theme}
          />
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
          disabled={!canContinue}
          className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
            canContinue
              ? 'bg-[#1A1FE8] text-white hover:bg-[#1217C8] shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)]'
              : 'bg-gray-500/40 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continuar
        </button>
      </div>
      {!canContinue && (
        <p className={`text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Valida el recibo y completa la plataforma 1 con las capturas necesarias (pueden ser varias fotos).
        </p>
      )}
    </div>
  );
}
