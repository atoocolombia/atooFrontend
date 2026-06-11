import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BenefitsSection } from './components/BenefitsSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { VehiclesSection } from './components/VehiclesSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { useTheme } from './contexts/ThemeContext';

export function Root() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#06071A]' : 'bg-white'}`}>
      <Header />
      <main>
        <HeroSection />
        <BenefitsSection />
        <HowItWorksSection />
        <VehiclesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}