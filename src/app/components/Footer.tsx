import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { landingLightSurfaces } from '../styles/landingSurfaces';

export function Footer() {
  const { theme } = useTheme();
  
  return (
    <footer id="contacto" className={`relative border-t transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-[#06071A] text-gray-300 border-[#1A1FE8]/15'
        : `${landingLightSurfaces.footer} text-gray-300 border-white/10`
    }`}>
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${theme === 'light' ? 'via-white/20' : 'via-[#1A1FE8]/40'} to-transparent`} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[160px] ${
          theme === 'dark' ? 'bg-[#1A1FE8]/12' : 'bg-[#1A1FE8]/10'
        }`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-3xl font-bold tracking-wide text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600', letterSpacing: '-0.02em' }}>atoo</span>
              <span className="text-[10px] -mt-1 tracking-wider uppercase text-blue-400/60">Yours Tomorrow</span>
            </div>
            <p className="text-sm text-gray-400">
              La mejor opción para conductores que quieren ser dueños de su vehículo.
            </p>
            <div className="flex gap-4">
              <a href="#" className="group w-10 h-10 backdrop-blur-sm border rounded-full flex items-center justify-center transition-all bg-white/5 border-blue-600/20 hover:bg-[#1A1FE8] hover:border-transparent hover:shadow-[0_0_20px_rgba(26,31,232,0.4)]">
                <Facebook className="w-5 h-5 transition-colors text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="group w-10 h-10 backdrop-blur-sm border rounded-full flex items-center justify-center transition-all bg-white/5 border-blue-600/20 hover:bg-[#1A1FE8] hover:border-transparent hover:shadow-[0_0_20px_rgba(26,31,232,0.4)]">
                <Instagram className="w-5 h-5 transition-colors text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="group w-10 h-10 backdrop-blur-sm border rounded-full flex items-center justify-center transition-all bg-white/5 border-blue-600/20 hover:bg-[#1A1FE8] hover:border-transparent hover:shadow-[0_0_20px_rgba(26,31,232,0.4)]">
                <Twitter className="w-5 h-5 transition-colors text-gray-400 group-hover:text-white" />
              </a>
              <a href="#" className="group w-10 h-10 backdrop-blur-sm border rounded-full flex items-center justify-center transition-all bg-white/5 border-blue-600/20 hover:bg-[#1A1FE8] hover:border-transparent hover:shadow-[0_0_20px_rgba(26,31,232,0.4)]">
                <Linkedin className="w-5 h-5 transition-colors text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Nosotros</a></li>
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Blog</a></li>
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Carreras</a></li>
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Prensa</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Soporte</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Centro de Ayuda</a></li>
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">FAQ</a></li>
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Contacto</a></li>
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Términos y Condiciones</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Privacidad</a></li>
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Términos de Uso</a></li>
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Cookies</a></li>
              <li><a href="#" className="transition-colors text-gray-400 hover:text-blue-400">Licencias</a></li>
            </ul>
          </div>
        </div>

        <div className={`border-t mt-12 pt-8 text-sm text-center ${theme === 'dark' ? 'border-[#1A1FE8]/12' : 'border-white/10'}`}>
          <p className="text-gray-400">&copy; 2026 <span className="font-semibold text-white">atoo</span>. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}