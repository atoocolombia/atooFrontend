import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';
import { setAuthRedirect } from '../../lib/authRouting';

type AuthModalContextValue = {
  openRegister: () => void;
  openLogin: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openRegister = useCallback(() => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  }, []);

  const openLogin = useCallback(() => {
    if (location.pathname === '/solicitud') {
      setAuthRedirect('/solicitud');
    }
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  }, [location.pathname]);

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <AuthModalContext.Provider value={{ openRegister, openLogin }}>
      {children}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal debe usarse dentro de AuthModalProvider');
  }
  return ctx;
}
