import { useTheme } from '../contexts/ThemeContext';
import { landingLightSurfaces, landingLightType } from '../styles/landingSurfaces';
import { LandingEyebrow } from './landing/LandingEyebrow';
import { resolveBenefitIcon } from '../data/landingContent';
import { useLandingContent } from '../../lib/useLandingContent';

export function BenefitsSection() {
  const { theme } = useTheme();
  const { content } = useLandingContent();
  const { benefits } = content;
  const isLight = theme === 'light';

  return (
    <section
      id="beneficios"
      className={`relative py-28 overflow-hidden transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#06071A]' : landingLightSurfaces.benefits
      }`}
    >
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
          {isLight ? (
            <LandingEyebrow>{benefits.badge}</LandingEyebrow>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium mb-5 bg-[#1A1FE8]/15 border-[#1A1FE8]/30 text-blue-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A1FE8] animate-pulse" />
              {benefits.badge}
            </div>
          )}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            <span className={isLight ? landingLightType.titleOnWhite : 'text-white'}>
              {benefits.titleBefore}
            </span>
            <span
              style={{
                color: '#1A1FE8',
                textShadow: theme === 'dark' ? '0 0 40px rgba(26,31,232,0.5)' : 'none',
              }}
            >
              {benefits.titleHighlight}
            </span>
            <span className={isLight ? landingLightType.titleOnWhite : 'text-white'}>
              {benefits.titleAfter}
            </span>
          </h2>
          <p
            className={`text-xl leading-relaxed ${isLight ? landingLightType.bodyOnWhite : 'text-gray-400'}`}
          >
            {benefits.description}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.items.map((benefit, index) => {
            const Icon = resolveBenefitIcon(benefit.icon);
            return (
              <div key={index} className="group relative">
                {theme === 'dark' && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-[0.12] rounded-2xl blur-xl transition-all duration-500`}
                  />
                )}

                <div
                  className={`relative h-full transition-all duration-300 overflow-hidden ${
                    isLight
                      ? 'rounded-2xl bg-white border border-gray-200/80 shadow-[0_1px_0_rgba(26,31,232,0.06)] hover:shadow-[0_12px_40px_rgba(26,31,232,0.08)] hover:border-[#1A1FE8]/30'
                      : 'rounded-2xl p-6 bg-white/[0.04] border border-white/[0.08] hover:border-[#1A1FE8]/40 hover:bg-white/[0.07] hover:shadow-[0_0_40px_rgba(26,31,232,0.2)]'
                  }`}
                >
                  {isLight && <div className="h-1.5 w-full bg-[#1A1FE8]" />}

                  <div className={isLight ? 'p-6' : ''}>
                    <div
                      className={`w-12 h-12 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 ${
                        isLight
                          ? 'rounded-xl bg-[#1A1FE8] text-white'
                          : `bg-gradient-to-br ${benefit.gradient} rounded-xl shadow-[0_4px_20px_rgba(26,31,232,0.3)]`
                      }`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <h3
                      className={`font-bold mb-2 transition-colors ${
                        isLight ? 'text-gray-900' : 'text-white group-hover:text-[#6B70F5]'
                      }`}
                    >
                      {benefit.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        isLight ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {benefit.description}
                    </p>

                    {isLight && (
                      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1FE8]/70">
                        atoo signature
                      </p>
                    )}

                    {!isLight && (
                      <div
                        className={`absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r ${benefit.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-300`}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
