import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useTheme } from '../contexts/ThemeContext';

const HERO_VIDEO = '/hero/hero-bg.mp4';
const HERO_POSTER = '/hero/hero-poster.jpg';

const fallbackPosterDark =
  'https://images.unsplash.com/photo-1672783521773-4ad176cfa461?w=1920&fit=crop&auto=format';
const fallbackPosterLight =
  'https://images.unsplash.com/photo-1522770450359-3de04ff5c9e2?w=1920&fit=crop&auto=format';

export function HeroSection() {
  const { theme } = useTheme();
  const fallbackPoster = theme === 'dark' ? fallbackPosterDark : fallbackPosterLight;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src={fallbackPoster}
          alt="Fondo hero atoo"
          className="w-full h-full object-cover"
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          key={theme}
          className="absolute inset-0 w-full h-full object-cover"
          poster={HERO_POSTER}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        {/* Overlay — video visible en los bordes, más contraste en el centro */}
        {theme === 'dark' ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#06071A]/50 via-[#06071A]/45 to-[#06071A]/85" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 75% 55% at 50% 42%, rgba(6,7,26,0.72) 0%, rgba(6,7,26,0.35) 55%, transparent 100%)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1FE8]/12 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/40 to-white/95" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 75% 55% at 50% 42%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.45) 55%, transparent 100%)',
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white to-transparent" />
          </>
        )}
      </div>

      {/* Futuristic glow orbs */}
      {theme === 'dark' && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] bg-[#1A1FE8]/25 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] bg-[#3D42F0]/15 animate-pulse delay-1000" />
        </>
      )}
      {theme === 'light' && (
        <>
          <div className="absolute top-0 right-0 w-[700px] h-[400px] rounded-full blur-[200px] bg-[#1A1FE8]/12" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[300px] rounded-full blur-[160px] bg-[#1A1FE8]/8" />
        </>
      )}

      {/* Diagonal accent line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        theme === 'dark' ? 'bg-gradient-to-b from-transparent via-[#1A1FE8]/60 to-transparent' : 'bg-gradient-to-b from-transparent via-[#1A1FE8]/30 to-transparent'
      }`} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24">
        <div
          className={`max-w-3xl mx-auto text-center rounded-3xl px-6 py-10 sm:px-10 sm:py-12 border backdrop-blur-md ${
            theme === 'dark'
              ? 'bg-[#06071A]/40 border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)]'
              : 'bg-white/55 border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.08)]'
          }`}
        >

          <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm mb-8 backdrop-blur-md ${
            theme === 'dark'
              ? 'bg-[#1A1FE8]/20 border-[#1A1FE8]/40 text-blue-100 shadow-[0_0_20px_rgba(26,31,232,0.3)]'
              : 'bg-white/90 border-[#1A1FE8]/25 text-[#1A1FE8] shadow-[0_4px_24px_rgba(26,31,232,0.12)]'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-[#1A1FE8]" />
            <span className="font-medium">Tu propio vehículo en 60 meses</span>
          </div>

          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5 ${
              theme === 'dark' ? '[text-shadow:0_2px_24px_rgba(0,0,0,0.9)]' : '[text-shadow:0_2px_16px_rgba(255,255,255,0.9)]'
            }`}
          >
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Drive Today, </span>
            <span
              className="relative"
              style={{
                color: '#1A1FE8',
                textShadow:
                  theme === 'dark'
                    ? '0 2px 24px rgba(0,0,0,0.9), 0 0 40px rgba(26,31,232,0.5)'
                    : '0 2px 16px rgba(255,255,255,0.9), 0 0 30px rgba(26,31,232,0.25)',
              }}
            >
              Yours Tomorrow
            </span>
          </h1>

          <p
            className={`text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto ${
              theme === 'dark'
                ? 'text-gray-100 [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]'
                : 'text-gray-800 [text-shadow:0_1px_10px_rgba(255,255,255,0.85)]'
            }`}
          >
            Modelo Rent to Own para conductores de Uber, DiDi y más.
            Pagos semanales y al finalizar el plazo, ¡el vehículo es tuyo!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group relative px-8 py-4 bg-[#1A1FE8] text-white rounded-2xl overflow-hidden transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(26,31,232,0.5)] hover:shadow-[0_0_60px_rgba(26,31,232,0.7)]">
              <span className="relative z-10 flex items-center gap-2 font-semibold text-base">
                Comenzar Ahora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A1FE8] to-[#3D42F0] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            <button className={`group px-8 py-4 backdrop-blur-md border-2 rounded-2xl transition-all flex items-center justify-center gap-2 font-semibold text-base ${
              theme === 'dark'
                ? 'bg-white/8 text-white border-white/20 hover:border-[#1A1FE8]/60 hover:bg-[#1A1FE8]/15 hover:shadow-[0_0_30px_rgba(26,31,232,0.3)]'
                : 'bg-white/70 text-gray-900 border-gray-200 hover:border-[#1A1FE8]/40 hover:shadow-[0_8px_30px_rgba(26,31,232,0.15)]'
            }`}>
              <Play className="w-4 h-4 fill-current" />
              Ver Cómo Funciona
            </button>
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-32 ${
        theme === 'dark'
          ? 'bg-gradient-to-t from-[#06071A]/90 to-transparent'
          : 'bg-gradient-to-t from-white to-transparent'
      }`} />
    </section>
  );
}
