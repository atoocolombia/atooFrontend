import type { ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface MobileAppBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  right?: ReactNode;
  children?: ReactNode;
}

/** Barra superior de dashboards: respeta notch/hora de iPhone y centra “atoo” en mobile. */
export function MobileAppBar({
  isSidebarOpen,
  onToggleSidebar,
  right,
  children,
}: MobileAppBarProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`sticky top-0 z-50 border-b px-3 pb-3 lg:px-8 lg:pb-4 ${
        theme === 'dark'
          ? 'bg-[#0D0F2E]/90 backdrop-blur-md border-blue-600/20'
          : 'bg-white border-gray-200'
      }`}
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)',
      }}
    >
      <div className="relative flex items-center min-h-11">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`lg:hidden relative z-10 flex h-11 w-11 items-center justify-center rounded-lg ${
            theme === 'dark' ? 'text-white' : 'text-gray-700'
          }`}
          aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <p
          className={`lg:hidden pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-bold tracking-wide ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          atoo
        </p>

        <div className="relative z-10 ml-auto flex items-center">{right}</div>
      </div>
      {children}
    </div>
  );
}
