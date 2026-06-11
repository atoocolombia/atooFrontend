import { useState } from 'react';
import { Upload, CreditCard, Camera, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface IdentityDocumentsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function IdentityDocumentsStep({ onNext, onBack }: IdentityDocumentsStepProps) {
  const { theme } = useTheme();
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [licenseFront, setLicenseFront] = useState<File | null>(null);
  const [licenseBack, setLicenseBack] = useState<File | null>(null);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
    }
  };

  const handleSubmit = () => {
    // No validamos por ahora según lo solicitado
    onNext();
  };

  const FileUploadBox = ({
    id,
    file,
    label,
    icon: Icon,
    onChange,
  }: {
    id: string;
    file: File | null;
    label: string;
    icon: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div>
      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          file
            ? theme === 'dark'
              ? 'border-green-500 bg-green-500/10'
              : 'border-green-500 bg-green-50'
            : theme === 'dark'
              ? 'border-blue-600/30 hover:border-[#1A1FE8] bg-white/5'
              : 'border-gray-300 hover:border-[#1A1FE8] bg-gray-50'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {file ? (
            <>
              <Icon className="w-10 h-10 text-green-600 mb-2" />
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{file.name}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </>
          ) : (
            <>
              <Upload className={`w-10 h-10 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-semibold">Click para subir</span>
              </p>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>JPG o PNG</p>
            </>
          )}
        </div>
        <input
          id={id}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onChange}
        />
      </label>
    </div>
  );

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

      {/* Documento de Identidad */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark'
          ? 'bg-[#06071A]/50 border-blue-600/20'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Documento de Identidad
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FileUploadBox
            id="id-front"
            file={idFront}
            label="Frente del documento"
            icon={CreditCard}
            onChange={(e) => handleFileChange(e, setIdFront)}
          />
          <FileUploadBox
            id="id-back"
            file={idBack}
            label="Reverso del documento"
            icon={CreditCard}
            onChange={(e) => handleFileChange(e, setIdBack)}
          />
        </div>
        <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          💡 Asegúrate de que los datos sean legibles y la foto esté completa
        </p>
      </div>

      {/* Licencia de Conducción */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark'
          ? 'bg-[#06071A]/50 border-blue-600/20'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Licencia de Conducción
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FileUploadBox
            id="license-front"
            file={licenseFront}
            label="Frente de la licencia"
            icon={CreditCard}
            onChange={(e) => handleFileChange(e, setLicenseFront)}
          />
          <FileUploadBox
            id="license-back"
            file={licenseBack}
            label="Reverso de la licencia"
            icon={CreditCard}
            onChange={(e) => handleFileChange(e, setLicenseBack)}
          />
        </div>
        <p className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
          💡 Verifica que tu licencia esté vigente y sea categoría B1 o superior
        </p>
      </div>

      {/* Foto de Rostro */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark'
          ? 'bg-[#06071A]/50 border-blue-600/20'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Foto de Rostro
        </h3>
        <FileUploadBox
          id="face-photo"
          file={facePhoto}
          label="Foto con buena iluminación"
          icon={Camera}
          onChange={(e) => handleFileChange(e, setFacePhoto)}
        />
        <div className={`mt-4 p-4 rounded-lg border ${
          theme === 'dark'
            ? 'bg-blue-600/10 border-blue-600/30'
            : 'bg-blue-50 border-blue-200'
        }`}>
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

      {/* Botones de navegación */}
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
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold shadow-[0_0_20px_rgba(26,31,232,0.3)] hover:shadow-[0_0_30px_rgba(26,31,232,0.5)]"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
