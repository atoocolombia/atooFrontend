import type { ComponentType } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import type { UserDocumentMeta } from '../../../lib/documentsApi';

interface PersistedFileUploadProps {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  accept?: string;
  required?: boolean;
  saved?: UserDocumentMeta | null;
  uploading?: boolean;
  error?: string | null;
  onFileSelected: (file: File) => void;
}

export function PersistedFileUpload({
  id,
  label,
  icon: Icon,
  accept = 'image/*',
  required = false,
  saved,
  uploading = false,
  error,
  onFileSelected,
}: PersistedFileUploadProps) {
  const { theme } = useTheme();
  const hasFile = Boolean(saved);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    e.target.value = '';
  };

  return (
    <div>
      <label
        className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors ${
          uploading
            ? 'cursor-wait opacity-80'
            : 'cursor-pointer'
        } ${
          hasFile
            ? theme === 'dark'
              ? 'border-green-500 bg-green-500/10'
              : 'border-green-500 bg-green-50'
            : theme === 'dark'
              ? 'border-blue-600/30 hover:border-[#1A1FE8] bg-white/5'
              : 'border-gray-300 hover:border-[#1A1FE8] bg-gray-50'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-[#1A1FE8] mb-2 animate-spin" />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Subiendo archivo…
              </p>
            </>
          ) : hasFile && saved ? (
            <>
              <Icon className="w-10 h-10 text-green-600 mb-2" />
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {saved.originalName}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {(saved.sizeBytes / 1024 / 1024).toFixed(2)} MB
              </p>
              {saved.validationStatus === 'REJECTED' && saved.validationMessage && (
                <p className="text-xs text-red-500 mt-1 text-center px-4">{saved.validationMessage}</p>
              )}
            </>
          ) : (
            <>
              <Upload className={`w-10 h-10 mb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="font-semibold">Click para subir</span>
              </p>
            </>
          )}
        </div>
        <input
          id={id}
          type="file"
          className="hidden"
          accept={accept}
          disabled={uploading}
          onChange={handleChange}
        />
      </label>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
