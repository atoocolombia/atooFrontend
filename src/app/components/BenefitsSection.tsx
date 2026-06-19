import { useTheme } from '../contexts/ThemeContext';
import { landingLightSurfaces } from '../styles/landingSurfaces';
import { resolveBenefitIcon } from '../data/landingContent';
import { useLandingContent } from '../../lib/useLandingContent';

export function BenefitsSection() {
  const { theme } = useTheme();
  const { content } = useLandingContent();
  const { benefits } = content;

  return (
    <section id="beneficios" className={`relative py-28 overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#06071A]' : landingLightSurfaces.benefits
    }`}>

      {/* Aurora orbs — solo oscuro */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme === 'dark' && (
          <>
            <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[200px] bg-[#1A1FE8]/20 animate-pulse" />
            <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[180px] bg-[#3D42F0]/15 animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[160px] bg-[#1A1FE8]/10" />
          </>
        )}
      </div>

      {theme === 'dark' && (
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0D0F2E] to-transparent" />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium mb-5 ${
            theme === 'dark'
              ? 'bg-[#1A1FE8]/15 border-[#1A1FE8]/30 text-blue-300'
              : 'bg-[#1A1FE8]/8 border-[#1A1FE8]/20 text-[#1A1FE8]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1FE8] animate-pulse" />
            {benefits.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{benefits.titleBefore}</span>
            <span style={{ color: '#1A1FE8', textShadow: theme === 'dark' ? '0 0 40px rgba(26,31,232,0.5)' : 'none' }}>{benefits.titleHighlight}</span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{benefits.titleAfter}</span>
          </h2>
          <p className={`text-xl leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {benefits.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.items.map((benefit, index) => {
            const Icon = resolveBenefitIcon(benefit.icon);
            return (
              <div key={index} className="group relative">
                {/* Glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-[0.12] rounded-2xl blur-xl transition-all duration-500`} />

                <div className={`relative rounded-2xl p-6 h-full transition-all duration-300 border ${
                  theme === 'dark'
                    ? 'bg-white/[0.04] border-white/[0.08] hover:border-[#1A1FE8]/40 hover:bg-white/[0.07] hover:shadow-[0_0_40px_rgba(26,31,232,0.2)]'
                    : 'bg-[#F3F5FF] border-[#D8DEFA] hover:border-[#1A1FE8]/35 hover:shadow-[0_8px_32px_rgba(26,31,232,0.12)]'
                }`}>
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center mb-4 shadow-[0_4px_20px_rgba(26,31,232,0.3)] group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white group-hover:text-[#6B70F5]' : 'text-gray-900'
                  }`}>
                    {benefit.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {benefit.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r ${benefit.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
