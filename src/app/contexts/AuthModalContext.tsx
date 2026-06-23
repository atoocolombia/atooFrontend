import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';

type AuthModalContextValue = {
  openRegister: () => void;
  openLogin: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openRegister = useCallback(() => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  }, []);

  const openLogin = useCallback(() => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  }, []);

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
