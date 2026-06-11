import { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface InitialStepProps {
  onNext: (data: any) => void;
  initialData: any;
}

export function InitialStep({ onNext, initialData }: InitialStepProps) {
  const { theme } = useTheme();
  const [cvFile, setCvFile] = useState<File | null>(initialData.cvFile);
  const [uberProfile, setUberProfile] = useState<File | null>(initialData.uberProfile);
  const [errors, setErrors] = useState({ cv: '', uber: '' });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cv' | 'uber'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'cv') {
        // Validar que sea PDF o DOC
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
          setErrors({ ...errors, cv: 'Por favor sube un archivo PDF o DOC' });
          return;
        }
        setCvFile(file);
        setErrors({ ...errors, cv: '' });
      } else {
        // Validar que sea imagen
        if (!file.type.startsWith('image/')) {
          setErrors({ ...errors, uber: 'Por favor sube una imagen (JPG, PNG)' });
          return;
        }
        setUberProfile(file);
        setErrors({ ...errors, uber: '' });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cvFile || !uberProfile) {
      setErrors({
        cv: !cvFile ? 'La hoja de vida es requerida' : '',
        uber: !uberProfile ? 'El perfil de Uber es requerido' : '',
      });
      return;
    }

    onNext({ cvFile, uberProfile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          ¡Iniciemos tu Solicitud!
        </h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Para comenzar, necesitamos algunos documentos básicos
        </p>
      </div>

      {/* CV Upload */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Hoja de Vida (CV) *
        </label>
        <div className="mt-1">
          <label
            htmlFor="cv-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              cvFile
                ? theme === 'dark'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-green-500 bg-green-50'
                : errors.cv
                ? theme === 'dark'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-red-500 bg-red-50'
                : theme === 'dark'
                  ? 'border-blue-600/30 hover:border-[#1A1FE8] bg-white/5'
                  : 'border-gray-300 hover:border-[#1A1FE8] bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {cvFile ? (
                <>
                  <FileText className="w-10 h-10 text-green-600 mb-2" />
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{cvFile.name}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload className={`w-10 h-10 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-semibold">Click para subir</span> o arrastra tu CV
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>PDF o DOC (máx. 10MB)</p>
                </>
              )}
            </div>
            <input
              id="cv-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, 'cv')}
            />
          </label>
          {errors.cv && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.cv}
            </p>
          )}
        </div>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          💡 Si subes tu CV, extraeremos automáticamente la información necesaria
        </p>
      </div>

      {/* Uber Profile Screenshot */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Captura de Perfil de Uber/DiDi *
        </label>
        <div className="mt-1">
          <label
            htmlFor="uber-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              uberProfile
                ? theme === 'dark'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-green-500 bg-green-50'
                : errors.uber
                ? theme === 'dark'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-red-500 bg-red-50'
                : theme === 'dark'
                  ? 'border-blue-600/30 hover:border-[#1A1FE8] bg-white/5'
                  : 'border-gray-300 hover:border-[#1A1FE8] bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uberProfile ? (
                <>
                  <ImageIcon className="w-10 h-10 text-green-600 mb-2" />
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{uberProfile.name}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {(uberProfile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <Upload className={`w-10 h-10 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span className="font-semibold">Click para subir</span> o arrastra la imagen
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>JPG o PNG (máx. 5MB)</p>
                </>
              )}
            </div>
            <input
              id="uber-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'uber')}
            />
          </label>
          {errors.uber && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.uber}
            </p>
          )}
        </div>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          📸 Sube una captura donde se vea tu calificación y datos de conductor
        </p>
      </div>

      {/* Info Box */}
      <div className={`border rounded-lg p-4 ${
        theme === 'dark'
          ? 'bg-blue-600/10 border-blue-600/30'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-900'}`}>
          ¿Por qué necesitamos esto?
        </h4>
        <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-blue-200' : 'text-blue-800'}`}>
          <li>• Tu CV nos ayuda a conocer tu experiencia como conductor</li>
          <li>• El perfil de Uber/DiDi verifica tu calificación y actividad</li>
          <li>• Estos documentos aceleran el proceso de aprobación</li>
        </ul>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
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