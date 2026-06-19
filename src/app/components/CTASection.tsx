import { ArrowRight, Phone, Mail, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { landingLightSurfaces } from '../styles/landingSurfaces';
import { splitContactDescription } from '../data/landingContent';
import { useLandingContent } from '../../lib/useLandingContent';

export function CTASection() {
  const { theme } = useTheme();
  const { content } = useLandingContent();
  const { contact } = content;
  const isBrandCta = theme === 'light';
  const [descBefore, descAfter] = splitContactDescription(contact.description, contact.driverCount);

  return (
    <section className={`relative py-32 overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#06071A]' : landingLightSurfaces.cta
    }`}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme === 'dark' ? (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full blur-[250px] bg-[#1A1FE8]/22" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[160px] bg-[#3D42F0]/12" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[160px] bg-[#1A1FE8]/10" />
          </>
        ) : (
          <>
            <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full blur-[180px] bg-white/15" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full blur-[160px] bg-[#3D42F0]/25" />
          </>
        )}
      </div>

      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isBrandCta ? 'via-white/35' : 'via-[#1A1FE8]/40'} to-transparent`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">

          <div className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-full text-sm mb-8 ${
            isBrandCta
              ? 'bg-white/15 border-white/30 text-white'
              : theme === 'dark'
                ? 'bg-[#1A1FE8]/15 border-[#1A1FE8]/30 text-blue-300'
                : 'bg-[#1A1FE8]/8 border-[#1A1FE8]/20 text-[#1A1FE8]'
          }`}>
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">{contact.badge}</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className={isBrandCta ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-900'}>{contact.titleBefore}</span>
            <span
              style={{
                color: isBrandCta ? '#FFFFFF' : '#1A1FE8',
                textShadow: theme === 'dark' ? '0 0 60px rgba(26,31,232,0.6)' : isBrandCta ? 'none' : '0 0 30px rgba(26,31,232,0.15)',
              }}
            >
              {contact.titleHighlight}
            </span>
            <span className={isBrandCta ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-900'}>{contact.titleAfter}</span>
          </h2>

          <p className={`text-xl mb-12 leading-relaxed ${isBrandCta ? 'text-white/85' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {descAfter ? (
              <>
                {descBefore}
                <span className={`font-bold ${isBrandCta ? 'text-white' : 'text-[#1A1FE8]'}`}>
                  {contact.driverCount}
                </span>
                {descAfter}
              </>
            ) : (
              descBefore
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
            <button className={`group relative px-10 py-4 rounded-2xl font-bold text-base overflow-hidden transition-all duration-300 ${
              isBrandCta
                ? 'bg-white text-[#1A1FE8] shadow-[0_8px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]'
                : 'bg-[#1A1FE8] text-white shadow-[0_0_50px_rgba(26,31,232,0.45)] hover:shadow-[0_0_70px_rgba(26,31,232,0.65)]'
            }`}>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Solicitar Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {!isBrandCta && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A1FE8] to-[#3D42F0] opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>

            <button className={`px-10 py-4 border-2 rounded-2xl font-bold text-base transition-all duration-300 ${
              isBrandCta
                ? 'border-white/50 text-white hover:bg-white/10 hover:border-white'
                : theme === 'dark'
                  ? 'border-[#1A1FE8]/30 text-white hover:border-[#1A1FE8] hover:bg-[#1A1FE8]/10 hover:shadow-[0_0_30px_rgba(26,31,232,0.25)]'
                  : 'border-[#1A1FE8]/25 text-gray-800 hover:border-[#1A1FE8]/50 hover:bg-[#1A1FE8]/5 hover:shadow-[0_8px_30px_rgba(26,31,232,0.12)]'
            }`}>
              Agendar Llamada
            </button>
          </div>

          {/* Contact cards */}
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto mb-12">
            {[
              { icon: Phone, label: contact.phoneLabel, value: contact.phone },
              { icon: Mail, label: contact.emailLabel, value: contact.email },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="group relative">
                <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${isBrandCta ? 'bg-white/20' : 'bg-[#1A1FE8]/15'}`} />
                <div className={`relative flex items-center gap-4 rounded-2xl p-5 border transition-all ${
                  isBrandCta
                    ? 'bg-white/12 border-white/25 hover:border-white/45 hover:bg-white/18'
                    : theme === 'dark'
                      ? 'bg-white/[0.04] border-white/[0.08] hover:border-[#1A1FE8]/40'
                      : 'bg-white border-gray-100 shadow-sm hover:border-[#1A1FE8]/30 hover:shadow-[0_4px_20px_rgba(26,31,232,0.1)]'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isBrandCta ? 'bg-white text-[#1A1FE8]' : 'bg-[#1A1FE8] text-white shadow-[0_0_20px_rgba(26,31,232,0.4)]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className={`text-xs font-medium mb-0.5 ${isBrandCta ? 'text-white/75' : theme === 'dark' ? 'text-[#6B70F5]' : 'text-[#1A1FE8]'}`}>{label}</div>
                    <div className={`font-bold ${isBrandCta ? 'text-white' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className={`flex flex-wrap justify-center gap-8 text-sm ${isBrandCta ? 'text-white/75' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {contact.trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
