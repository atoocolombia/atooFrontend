import { Outlet } from 'react-router';
import { OfflineBanner } from './components/OfflineBanner';
import { PwaNotificationPrompt } from './components/PwaNotificationPrompt';
import { AuthModalProvider } from './contexts/AuthModalContext';

/** Envuelve todas las rutas con auth modals dentro del router (useNavigate en modales). */
export function AppLayout() {
  return (
    <AuthModalProvider>
      <Outlet />
      <PwaNotificationPrompt />
      <OfflineBanner />
    </AuthModalProvider>
  );
}
