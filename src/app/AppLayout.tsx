import { Outlet } from 'react-router';
import { AuthModalProvider } from './contexts/AuthModalContext';

/** Envuelve todas las rutas con auth modals dentro del router (useNavigate en modales). */
export function AppLayout() {
  return (
    <AuthModalProvider>
      <Outlet />
    </AuthModalProvider>
  );
}
