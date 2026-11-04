import { Shield, Lock, Eye, CheckCircle, GraduationCap, Download, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { PersistedFileUpload } from './PersistedFileUpload';
import { useApplicationUploads } from '../../hooks/useApplicationUploads';
import type { UserDocumentMeta } from '../../../lib/documentsApi';

/** PDF estático en frontend/public/legal/ — desplegado en /legal/... */
export const DATA_TREATMENT_AUTHORIZATION_PDF_URL =
  '/legal/autorizacion-tratamiento-datos-atoo.pdf';

interface DataAuthorizationStepProps {
  userId: string;
  documents: Record<string, UserDocumentMeta>;
  onDocumentUploaded: (doc: UserDocumentMeta) => void;
  onNext: () => void;
}

export function DataAuthorizationStep({
  userId,
  documents,
  onDocumentUploaded,
  onNext,
}: DataAuthorizationStepProps) {
  const { theme } = useTheme();
  const { upload, isUploading, getError } = useApplicationUploads(userId, onDocumentUploaded);

  const signedDoc = documents.dataTreatmentSigned;
  const isValidated = signedDoc?.validationStatus === 'VALIDATED';
  const isRejected = signedDoc?.validationStatus === 'REJECTED';

  const signedAtLabel =
    signedDoc?.signedAt &&
    new Date(signedDoc.signedAt).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1A1FE8]/20 border-2 border-[#1A1FE8] mb-4 shadow-[0_0_20px_rgba(26,31,232,0.3)]">
          <Shield className="w-8 h-8 text-[#1A1FE8]" />
        </div>
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Autorización de Tratamiento de Datos
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Descarga el formato, fírmalo y súbelo en PDF para continuar
        </p>
      </div>

      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-[#1A1FE8]/15 to-emerald-500/10 border-[#1A1FE8]/40'
            : 'bg-gradient-to-r from-[#F0F0FD] to-emerald-50 border-[#1A1FE8]/30'
        }`}
      >
        <h3
          className={`text-lg font-bold mb-2 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          <GraduationCap className="w-5 h-5 text-[#1A1FE8]" />
          Prueba de conocimientos
        </h3>
        <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Como parte de tu solicitud en <strong className="text-[#1A1FE8]">atoo</strong>, deberás realizar una{' '}
          <strong>prueba de conocimientos</strong> sobre <strong>manejo de vehículo eléctrico</strong>,{' '}
          <strong>servicio</strong> (cuidado del vehículo y atención al cliente) y <strong>experiencia</strong> al
          conducir. Te indicaremos cuándo y cómo completarla a medida que avances en el proceso.
        </p>
      </div>

      {/* Descargar + subir autorización firmada */}
      <div
        className={`rounded-xl border p-6 space-y-5 ${
          theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5 text-[#1A1FE8]" />
              Paso 1: descarga y firma
            </p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Imprime o completa el PDF, indica tu número de documento, firma y registra la fecha de firma.
            </p>
          </div>
          <a
            href={DATA_TREATMENT_AUTHORIZATION_PDF_URL}
            download
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 shrink-0 px-5 py-2.5 rounded-lg border-2 border-[#1A1FE8] text-[#1A1FE8] font-semibold hover:bg-[#1A1FE8]/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </a>
        </div>

        <div>
          <p className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Paso 2: sube el PDF firmado
          </p>
          <PersistedFileUpload
            id="data-treatment-signed"
            label="Autorización de datos firmada (PDF)"
            icon={FileText}
            accept="application/pdf,.pdf"
            required
            saved={signedDoc}
            uploading={isUploading('dataTreatmentSigned')}
            error={getError('dataTreatmentSigned')}
            onFileSelected={(file) => upload('dataTreatmentSigned', file)}
          />
          <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Revisamos con IA que sea el formato de atoo, que incluya tu documento de identidad, firma y fecha. Si
            todo es correcto, guardamos la fecha de firma y asociamos tu cédula a tu cuenta.
          </p>
          {isValidated && signedAtLabel && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-3 font-medium">
              Autorización validada — firmada el {signedAtLabel}.
            </p>
          )}
          {isRejected && signedDoc?.validationMessage && (
            <p className="text-sm text-red-500 mt-3">{signedDoc.validationMessage}</p>
          )}
        </div>
      </div>

      {/* Información sobre el tratamiento de datos */}
      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark' ? 'bg-[#06071A]/50 border-blue-600/20' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <h3
          className={`text-xl font-bold mb-4 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          <Lock className="w-5 h-5 text-[#1A1FE8]" />
          ¿Cómo utilizaremos tus datos?
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Verificación de identidad
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Validaremos tu identidad mediante documentos oficiales para garantizar la seguridad del proceso
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Consulta de antecedentes
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Realizaremos consultas en bases de datos públicas (Policía, Procuraduría, SIMIT) para verificar tu
                historial y revisar si tienes comparendos o multas de tránsito pendientes
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Análisis crediticio
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                Evaluaremos tu información bancaria para determinar tu capacidad de pago
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl border p-6 ${
          theme === 'dark' ? 'bg-blue-600/10 border-blue-600/30' : 'bg-blue-50 border-blue-200'
        }`}
      >
        <h3
          className={`text-lg font-bold mb-3 flex items-center gap-2 ${
            theme === 'dark' ? 'text-blue-400' : 'text-blue-950'
          }`}
        >
          <Eye className="w-5 h-5" />
          Tus derechos como titular de los datos
        </h3>
        <ul className={`text-sm space-y-2 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>
          <li>• Conocer, actualizar y rectificar tus datos personales</li>
          <li>• Solicitar prueba de la autorización otorgada</li>
          <li>• Revocar la autorización y/o solicitar la supresión del dato</li>
          <li>• Acceder de forma gratuita a tus datos personales</li>
          <li>• Presentar quejas ante la Superintendencia de Industria y Comercio</li>
        </ul>
      </div>

      <div className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
        <p>
          Al continuar, confirmas que la autorización firmada corresponde a la{' '}
          <strong className="text-[#1A1FE8]">Política de Privacidad</strong> de atoo y a la Ley 1581 de 2012.
        </p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!isValidated || isUploading('dataTreatmentSigned')}
          className="px-8 py-3 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold shadow-[0_0_20px_rgba(26,31,232,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
