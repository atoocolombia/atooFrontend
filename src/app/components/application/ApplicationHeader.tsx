import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ApplicationHeaderProps {
  onBack: () => void;
}

export function ApplicationHeader({ onBack }: ApplicationHeaderProps) {
  const { theme } = useTheme();

  return (
    <header className={`border-b transition-colors ${
      theme === 'dark'
        ? 'bg-[#0D0F2E] border-blue-600/20'
        : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </button>

          <div className="flex flex-col">
            <span className={`text-3xl font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600', letterSpacing: '-0.02em' }}>atoo</span>
            <span className={`text-[10px] -mt-1 tracking-wider uppercase ${theme === 'dark' ? 'text-blue-400/60' : 'text-blue-700/60'}`}>Yours Tomorrow</span>
          </div>
        </div>

        {/* Mobile Layout - Logo Centrado */}
        <div className="sm:hidden flex flex-col items-center">
          <div className="flex flex-col items-center mb-3">
            <span className={`text-3xl font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600', letterSpacing: '-0.02em' }}>atoo</span>
            <span className={`text-[10px] -mt-1 tracking-wider uppercase ${theme === 'dark' ? 'text-blue-400/60' : 'text-blue-700/60'}`}>Yours Tomorrow</span>
          </div>
          <button
            onClick={onBack}
            className={`flex items-center gap-2 transition-colors text-sm ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </button>
        </div>
      </div>
    </header>
  );
}