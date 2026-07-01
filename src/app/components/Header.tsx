import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openLogin, openRegister } = useAuthModal();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-[#06071A]/90 backdrop-blur-md border-b border-blue-600/20 shadow-[0_0_30px_rgba(26,31,232,0.2)]'
          : 'bg-white border-b border-gray-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className={`text-3xl font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600', letterSpacing: '-0.02em' }}>atoo</span>
                <span className={`text-[10px] -mt-1 tracking-wider uppercase ${theme === 'dark' ? 'text-blue-400/60' : 'text-blue-700/60'}`}>Yours Tomorrow</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="flex items-center gap-8">
              {[
                { href: '#beneficios', label: 'Beneficios' },
                { href: '#como-funciona', label: 'Cómo Funciona' },
                { href: '#vehiculos', label: 'Vehículos' },
                { href: '#contacto', label: 'Contacto' },
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className={`relative transition-colors group text-sm font-medium tracking-wide ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-blue-400'
                      : 'text-gray-700 hover:text-[#1A1FE8]'
                  }`}
                >
                  {label}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                    theme === 'dark' ? 'bg-gradient-to-r from-[#1A1FE8] to-[#6B70F5]' : 'bg-[#1A1FE8]'
                  }`} />
                </a>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2 transition-colors rounded-lg ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:text-blue-200 hover:bg-white/5'
                    : 'text-blue-700 hover:text-blue-800 hover:bg-blue-50'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={openLogin}
                className={`px-4 py-2 transition-colors ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:text-blue-200'
                    : 'text-blue-700 hover:text-blue-800'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={openRegister}
                className={`group relative px-6 py-2 bg-[#1A1FE8] text-white overflow-hidden transition-all ${
                  theme === 'dark'
                    ? 'rounded-lg shadow-[0_0_20px_rgba(26,31,232,0.4)] hover:shadow-[0_0_30px_rgba(26,31,232,0.6)]'
                    : 'rounded-sm hover:bg-[#1217C8]'
                }`}
              >
                <span className="relative z-10">Registrarse</span>
                <div className="absolute inset-0 bg-[#1217C8] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>

          {/* Mobile Layout - Logo Centrado */}
          <div className="md:hidden flex items-center justify-center h-16 relative">
            {/* Logo Centrado */}
            <div className="flex flex-col items-center">
              <span className={`text-3xl font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600', letterSpacing: '-0.02em' }}>atoo</span>
              <span className={`text-[10px] -mt-1 tracking-wider uppercase ${theme === 'dark' ? 'text-blue-400/60' : 'text-blue-700/60'}`}>Yours Tomorrow</span>
            </div>

            {/* Mobile Menu Button - Derecha */}
            <button
              className="absolute right-0 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden border-t transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-[#0D0F2E]/95 backdrop-blur-md border-blue-600/20'
              : 'bg-white border-gray-200/80'
          }`}>
            <nav className="px-4 py-4 flex flex-col gap-4">
              <a
                href="#beneficios"
                className={`py-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-700'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Beneficios
              </a>
              <a
                href="#como-funciona"
                className={`py-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-700'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Cómo Funciona
              </a>
              <a
                href="#vehiculos"
                className={`py-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-700'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Vehículos
              </a>
              <a
                href="#contacto"
                className={`py-2 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-700'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </a>
              <div className={`flex flex-col gap-2 pt-4 border-t ${theme === 'dark' ? 'border-blue-600/20' : 'border-blue-200'}`}>
                <button
                  onClick={toggleTheme}
                  className={`px-4 py-2 border rounded-lg transition-all flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'text-blue-400 border-blue-600/30 hover:bg-white/5 hover:border-blue-600/50'
                      : 'text-blue-700 border-blue-400 hover:bg-blue-50 hover:border-blue-500'
                  }`}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                </button>
                <button
                  onClick={() => {
                    openLogin();
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-2 border rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'text-blue-400 border-blue-600/30 hover:bg-white/5 hover:border-blue-600/50'
                      : 'text-blue-700 border-blue-400 hover:bg-blue-50 hover:border-blue-500'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    openRegister();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 bg-[#1A1FE8] text-white rounded-lg hover:shadow-[0_0_20px_rgba(26,31,232,0.4)] transition-all"
                >
                  Registrarse
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}