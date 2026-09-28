import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type ThemeToggleButtonProps = {
  /** Botón compacto para la barra superior móvil */
  compact?: boolean;
  className?: string;
};

export function ThemeToggleButton({ compact, className = '' }: ThemeToggleButtonProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Usar modo claro' : 'Usar modo oscuro';

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={label}
        title={label}
        className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
          isDark ? 'text-blue-300 hover:bg-white/10' : 'text-blue-700 hover:bg-blue-50'
        } ${className}`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors ${
        isDark
          ? 'border-blue-600/30 bg-white/5 text-white hover:bg-white/10'
          : 'border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100'
      } ${className}`}
    >
      <span className="font-medium">{isDark ? 'Modo oscuro' : 'Modo claro'}</span>
      <span className="inline-flex items-center gap-2 text-sm opacity-80">
        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        Cambiar a {isDark ? 'claro' : 'oscuro'}
      </span>
    </button>
  );
}
