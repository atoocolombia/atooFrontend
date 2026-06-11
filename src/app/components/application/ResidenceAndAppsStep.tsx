import { useState } from 'react';
import { Upload, Home, Smartphone } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ResidenceAndAppsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ResidenceAndAppsStep({ onNext, onBack }: ResidenceAndAppsStepProps) {
  const { theme } = useTheme();
  const [utilityBill, setUtilityBill] = useState<File | null>(null);
  const [appProfile1, setAppProfile1] = useState<File | null>(null);
  const [appProfile2, setAppProfile2] = useState<File | null>(null);
  const [appProfile3, setAppProfile3] = useState<File | null>(null);

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
    onNext();
  };

  const FileUploadBox = ({
    id,
    file,
    label,
    icon: Icon,
    onChange,
    required = false,
  }: {
    id: string;
    file: File | null;
    label: string;
    icon: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
  }) => (
    <div>
      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
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
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>JPG, PNG o PDF</p>
            </>
          )}
        </div>
        <input
          id={id}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={onChange}
        />
      </label>
    </div>
  );

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

      {/* Servicio del Hogar */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark'
          ? 'bg-[#06071A]/50 border-blue-600/20'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Comprobante de Domicilio
        </h3>
        <FileUploadBox
          id="utility-bill"
          file={utilityBill}
          label="Recibo de servicio público (Agua, Luz o Gas)"
          icon={Home}
          onChange={(e) => handleFileChange(e, setUtilityBill)}
          required={true}
        />
        <div className={`mt-4 p-4 rounded-lg border ${
          theme === 'dark'
            ? 'bg-blue-600/10 border-blue-600/30'
            : 'bg-blue-50 border-blue-200'
        }`}>
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

      {/* Perfiles de Aplicaciones */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark'
          ? 'bg-[#06071A]/50 border-blue-600/20'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Perfiles de Aplicaciones de Movilidad
        </h3>
        <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Sube capturas de pantalla de tus perfiles en las aplicaciones donde has trabajado (opcional pero recomendado)
        </p>

        <div className="space-y-4">
          <FileUploadBox
            id="app-profile-1"
            file={appProfile1}
            label="Aplicación 1 (Ej: Uber, DiDi, Beat)"
            icon={Smartphone}
            onChange={(e) => handleFileChange(e, setAppProfile1)}
          />
          <FileUploadBox
            id="app-profile-2"
            file={appProfile2}
            label="Aplicación 2 (Opcional)"
            icon={Smartphone}
            onChange={(e) => handleFileChange(e, setAppProfile2)}
          />
          <FileUploadBox
            id="app-profile-3"
            file={appProfile3}
            label="Aplicación 3 (Opcional)"
            icon={Smartphone}
            onChange={(e) => handleFileChange(e, setAppProfile3)}
          />
        </div>

        <div className={`mt-4 p-4 rounded-lg border ${
          theme === 'dark'
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-green-50 border-green-200'
        }`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-800'}`}>
            💡 <strong>Tip:</strong> Si incluyes tus perfiles de aplicaciones con buenas calificaciones, acelerarás tu proceso de aprobación
          </p>
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
