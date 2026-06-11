import { useState } from 'react';
import { Upload, Building2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface BankingDocumentsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function BankingDocumentsStep({ onNext, onBack }: BankingDocumentsStepProps) {
  const { theme } = useTheme();
  const [bankStatement, setBankStatement] = useState<File | null>(null);
  const [creditHistory, setCreditHistory] = useState<File | null>(null);

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
    description,
  }: {
    id: string;
    file: File | null;
    label: string;
    icon: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    description: string;
  }) => (
    <div>
      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
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
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>PDF o imagen</p>
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
      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
        {description}
      </p>
    </div>
  );

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

      {/* Extracto Bancario */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark'
          ? 'bg-[#06071A]/50 border-blue-600/20'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Extracto Bancario
        </h3>
        <FileUploadBox
          id="bank-statement"
          file={bankStatement}
          label="Extracto bancario de los últimos 3 meses"
          icon={Building2}
          onChange={(e) => handleFileChange(e, setBankStatement)}
          description="📄 Descarga el extracto desde la app o portal web de tu banco"
        />
      </div>

      {/* Historial Crediticio */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark'
          ? 'bg-[#06071A]/50 border-blue-600/20'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Historial Crediticio
        </h3>
        <FileUploadBox
          id="credit-history"
          file={creditHistory}
          label="Consulta de DataCrédito o centrales de riesgo"
          icon={Building2}
          onChange={(e) => handleFileChange(e, setCreditHistory)}
          description="💳 Puedes obtenerlo gratis en www.midatacrédito.com"
        />
      </div>

      {/* Información adicional */}
      <div className={`p-6 rounded-xl border ${
        theme === 'dark'
          ? 'bg-blue-600/10 border-blue-600/30'
          : 'bg-blue-50 border-blue-200'
      }`}>
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
