import type { ComponentType } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
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

function borderClass(
  theme: string,
  saved: UserDocumentMeta | null | undefined,
  uploading: boolean,
): string {
  if (uploading) {
    return theme === 'dark'
      ? 'border-[#1A1FE8] bg-[#1A1FE8]/10'
      : 'border-[#1A1FE8] bg-blue-50';
  }
  if (!saved) {
    return theme === 'dark'
      ? 'border-blue-600/30 hover:border-[#1A1FE8] bg-white/5'
      : 'border-gray-300 hover:border-[#1A1FE8] bg-gray-50';
  }
  if (saved.validationStatus === 'VALIDATED') {
    return theme === 'dark' ? 'border-green-500 bg-green-500/10' : 'border-green-500 bg-green-50';
  }
  if (saved.validationStatus === 'REJECTED') {
    return theme === 'dark' ? 'border-red-500 bg-red-500/10' : 'border-red-500 bg-red-50';
  }
  return theme === 'dark' ? 'border-amber-500 bg-amber-500/10' : 'border-amber-400 bg-amber-50';
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

  const statusLabel =
    saved?.validationStatus === 'VALIDATED'
      ? 'Validado con IA'
      : saved?.validationStatus === 'REJECTED'
        ? 'Rechazado por la revisión automática'
        : saved?.validationStatus === 'PENDING'
          ? 'Pendiente de revisión'
          : null;

  return (
    <div>
      <label
        className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label
        htmlFor={id}
        className={`flex flex-col items-center justify-center w-full min-h-32 border-2 border-dashed rounded-lg transition-colors ${
          uploading ? 'cursor-wait opacity-90' : 'cursor-pointer'
        } ${borderClass(theme, saved, uploading)}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-[#1A1FE8] mb-2 animate-spin" />
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Subiendo y validando con IA…
              </p>
              <p className={`text-xs mt-1 text-center ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Puede tardar unos segundos
              </p>
            </>
          ) : hasFile && saved ? (
            <>
              {saved.validationStatus === 'VALIDATED' ? (
                <CheckCircle2 className="w-10 h-10 text-green-600 mb-2" />
              ) : saved.validationStatus === 'REJECTED' ? (
                <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
              ) : (
                <Icon className="w-10 h-10 text-amber-500 mb-2" />
              )}
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {saved.originalName}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                {(saved.sizeBytes / 1024 / 1024).toFixed(2)} MB
              </p>
              {statusLabel && (
                <p
                  className={`text-xs mt-1 font-medium ${
                    saved.validationStatus === 'VALIDATED'
                      ? 'text-green-600'
                      : saved.validationStatus === 'REJECTED'
                        ? 'text-red-500'
                        : 'text-amber-600'
                  }`}
                >
                  {statusLabel}
                </p>
              )}
              {saved.validationStatus === 'REJECTED' && saved.validationMessage && (
                <p className="text-xs text-red-500 mt-1 text-center">{saved.validationMessage}</p>
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
