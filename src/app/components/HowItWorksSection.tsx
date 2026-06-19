import { useTheme } from '../contexts/ThemeContext';
import { landingLightSurfaces } from '../styles/landingSurfaces';
import { resolveStepIcon } from '../data/landingContent';
import { useLandingContent } from '../../lib/useLandingContent';

export function HowItWorksSection() {
  const { theme } = useTheme();
  const { content } = useLandingContent();
  const { steps } = content;

  return (
    <section id="como-funciona" className={`relative py-28 overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#06071A]' : landingLightSurfaces.howItWorks
    }`}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {theme === 'dark' && (
          <>
            <div className="absolute top-0 right-0 w-[800px] h-[600px] rounded-full blur-[250px] bg-[#1A1FE8]/18" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[500px] rounded-full blur-[200px] bg-[#3D42F0]/12" />
          </>
        )}
      </div>

      {/* Thin horizontal accent */}
      <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A1FE8]/40 to-transparent`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className={`inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium mb-5 ${
            theme === 'dark'
              ? 'bg-[#1A1FE8]/15 border-[#1A1FE8]/30 text-blue-300'
              : 'bg-[#1A1FE8]/8 border-[#1A1FE8]/20 text-[#1A1FE8]'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1FE8] animate-pulse" />
            {steps.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{steps.titleBefore}</span>
            <span style={{ color: '#1A1FE8', textShadow: theme === 'dark' ? '0 0 40px rgba(26,31,232,0.5)' : 'none' }}>{steps.titleHighlight}</span>
            <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{steps.titleAfter}</span>
          </h2>
          <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {steps.description}
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px overflow-hidden">
            <div className={`h-full ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-[#1A1FE8]/0 via-[#1A1FE8]/50 to-[#1A1FE8]/0'
                : 'bg-gradient-to-r from-[#1A1FE8]/0 via-[#1A1FE8]/30 to-[#1A1FE8]/0'
            }`} />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.items.map((step, index) => {
              const Icon = resolveStepIcon(step.icon);
              return (
                <div key={index} className="group relative text-center">
                  {/* Step circle */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8 z-10">
                    <div className="absolute inset-0 rounded-full bg-[#1A1FE8] blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
                    <div className={`relative w-full h-full rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-[#0D0F2E] border-[#1A1FE8]/60 group-hover:border-[#1A1FE8] group-hover:bg-[#1A1FE8]/20'
                        : 'bg-white border-[#1A1FE8]/40 group-hover:border-[#1A1FE8] group-hover:shadow-[0_0_30px_rgba(26,31,232,0.25)]'
                    } shadow-[0_0_30px_rgba(26,31,232,0.4)]`}>
                      <span className="text-xl font-bold text-[#1A1FE8]">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon box */}
                  <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl border flex items-center justify-center transition-all duration-300 ${
                    theme === 'dark'
                      ? 'bg-[#1A1FE8]/10 border-[#1A1FE8]/25 group-hover:bg-[#1A1FE8]/20 group-hover:border-[#1A1FE8]/50'
                      : 'bg-[#1A1FE8]/8 border-[#1A1FE8]/15 group-hover:bg-[#1A1FE8]/15 group-hover:border-[#1A1FE8]/35'
                  }`}>
                    <Icon className="w-7 h-7 text-[#1A1FE8]" />
                  </div>

                  <h3 className={`font-bold mb-2 transition-colors ${
                    theme === 'dark' ? 'text-white group-hover:text-[#6B70F5]' : 'text-gray-900 group-hover:text-[#1A1FE8]'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-16">
          <button className="group relative px-10 py-4 bg-[#1A1FE8] text-white rounded-2xl font-bold text-base overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(26,31,232,0.4)] hover:shadow-[0_0_60px_rgba(26,31,232,0.6)]">
            <span className="relative z-10">{steps.ctaText}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A1FE8] to-[#3D42F0] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <p className={`text-sm mt-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {steps.ctaNote}
          </p>
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1A1FE8]/40 to-transparent`} />
    </section>
  );
}
