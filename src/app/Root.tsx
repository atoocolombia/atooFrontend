import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BenefitsSection } from './components/BenefitsSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { VehiclesSection } from './components/VehiclesSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { useTheme } from './contexts/ThemeContext';
import { landingLightSurfaces } from './styles/landingSurfaces';
import {
  getDashboardPath,
  getSessionUser,
  refreshSessionFromServer,
} from '../lib/authRouting';
import { getAuthToken } from '../lib/authTokenStorage';
import { isStandalonePwa } from '../lib/pwaNotifications';

function PwaSessionGate({ children }: { children: ReactNode }) {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [resolving, setResolving] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isStandalonePwa() && Boolean(getSessionUser({ refresh: false }) || getAuthToken());
  });

  useEffect(() => {
    if (!isStandalonePwa()) {
      setResolving(false);
      return;
    }

    const local = getSessionUser({ refresh: false });
    if (local) {
      setRedirectTo(getDashboardPath(local.userType));
      setResolving(false);
      return;
    }

    if (!getAuthToken()) {
      setResolving(false);
      return;
    }

    void refreshSessionFromServer().then((user) => {
      if (user) setRedirectTo(getDashboardPath(user.userType));
      setResolving(false);
    });
  }, []);

  if (redirectTo) return <Navigate to={redirectTo} replace />;
  if (resolving) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Entrando…
      </div>
    );
  }
  return children;
}

export function Root() {
  const { theme } = useTheme();

  return (
    <PwaSessionGate>
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#06071A]' : landingLightSurfaces.page}`}>
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
    </PwaSessionGate>
  );
}
