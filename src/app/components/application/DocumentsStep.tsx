import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface DocumentsStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

interface DocumentFile {
  file: File | null;
  uploaded: boolean;
}

export function DocumentsStep({ onNext, onBack, initialData }: DocumentsStepProps) {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState<Record<string, DocumentFile>>({
    idFront: { file: null, uploaded: false },
    idBack: { file: null, uploaded: false },
    licenseFront: { file: null, uploaded: false },
    licenseBack: { file: null, uploaded: false },
    utilityBill: { file: null, uploaded: false },
    reference1: { file: null, uploaded: false },
    reference2: { file: null, uploaded: false },
    familyReference: { file: null, uploaded: false },
  });

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      setDocuments({
        ...documents,
        [key]: { file, uploaded: true },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar que todos los documentos requeridos estén cargados
    const allUploaded = Object.values(documents).every(doc => doc.uploaded);

    if (!allUploaded) {
      alert('Por favor, sube todos los documentos requeridos');
      return;
    }

    onNext({ documents });
  };

  const DocumentUpload = ({ 
    label, 
    description, 
    docKey 
  }: { 
    label: string; 
    description: string; 
    docKey: string;
  }) => (
    <div className={`border rounded-lg p-4 ${
      theme === 'dark'
        ? 'border-blue-600/20 bg-white/5'
        : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{label}</h4>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
        </div>
        {documents[docKey].uploaded && (
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
        )}
      </div>
      
      <label
        htmlFor={`upload-${docKey}`}
        className={`mt-3 flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          documents[docKey].uploaded
            ? theme === 'dark'
              ? 'border-green-500 bg-green-500/10'
              : 'border-green-500 bg-green-50'
            : theme === 'dark'
              ? 'border-blue-600/30 hover:border-[#1A1FE8] bg-white/5'
              : 'border-gray-300 hover:border-[#1A1FE8] bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          {documents[docKey].uploaded ? (
            <>
              <FileText className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {documents[docKey].file?.name}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {documents[docKey].file && (documents[docKey].file!.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Click para subir archivo</span>
            </>
          )}
        </div>
        <input
          id={`upload-${docKey}`}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={(e) => handleFileChange(docKey, e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Documentos Legales
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Sube los documentos requeridos para completar tu solicitud
        </p>
      </div>

      {/* Legal Notice */}
      <div className={`border rounded-lg p-6 ${
        theme === 'dark'
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex gap-3">
          <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`} />
          <div>
            <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-amber-300' : 'text-amber-900'}`}>
              ⚖️ Información Legal Importante
            </h4>
            <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'}`}>
              <p>
                Los documentos que proporciones serán utilizados únicamente para verificar tu 
                identidad y validar tu solicitud de Rent to Own. Al continuar, aceptas que:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Todos los documentos son auténticos y no han sido alterados</li>
                <li>La información proporcionada es veraz y puede ser verificada</li>
                <li>atoo puede contactar a tus referencias para validar la información</li>
                <li>Tus datos serán tratados conforme a nuestra Política de Privacidad</li>
              </ul>
              <p className="font-medium mt-3">
                📋 Asegúrate de que todos los documentos sean legibles y estén vigentes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Identification Documents */}
      <div>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          1. Documento de Identidad
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <DocumentUpload
            label="Frente del Documento"
            description="Cédula, Pasaporte, PPT o Cédula de Extranjería"
            docKey="idFront"
          />
          <DocumentUpload
            label="Reverso del Documento"
            description="Parte trasera del documento"
            docKey="idBack"
          />
        </div>
      </div>

      {/* Driver's License */}
      <div>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          2. Licencia de Conducir
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <DocumentUpload
            label="Frente de la Licencia"
            description="Parte frontal de tu licencia vigente"
            docKey="licenseFront"
          />
          <DocumentUpload
            label="Reverso de la Licencia"
            description="Parte trasera de tu licencia"
            docKey="licenseBack"
          />
        </div>
      </div>

      {/* Utility Bill */}
      <div>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          3. Comprobante de Domicilio
        </h3>
        <DocumentUpload
          label="Recibo de Servicio"
          description="Agua, luz o gas registrado a tu nombre (no mayor a 3 meses)"
          docKey="utilityBill"
        />
      </div>

      {/* References */}
      <div>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          4. Referencias
        </h3>
        <div className="space-y-4">
          <DocumentUpload
            label="Referencia Comercial 1"
            description="Carta de referencia comercial con datos de contacto"
            docKey="reference1"
          />
          <DocumentUpload
            label="Referencia Comercial 2"
            description="Segunda carta de referencia comercial"
            docKey="reference2"
          />
          <DocumentUpload
            label="Referencia Familiar"
            description="Referencia de familiar con vivienda propia (incluir comprobante)"
            docKey="familyReference"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className={`border rounded-lg p-4 ${
        theme === 'dark'
          ? 'bg-blue-600/10 border-blue-600/30'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
          💡 Consejos para subir documentos
        </h4>
        <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
          <li>• Asegúrate de que las fotos estén bien iluminadas y sean legibles</li>
          <li>• Los archivos pueden ser imágenes (JPG, PNG) o PDF</li>
          <li>• Evita fotos borrosas o con reflejos</li>
          <li>• Todos los documentos deben estar vigentes</li>
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className={`px-8 py-3 border rounded-lg transition-colors font-semibold ${
            theme === 'dark'
              ? 'border-blue-600/30 text-gray-300 hover:bg-white/5'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Atrás
        </button>
        <button
          type="submit"
          className="px-8 py-3 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)]"
        >
          Continuar
        </button>
      </div>
    </form>
  );
}