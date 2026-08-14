import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { UserType } from '../../lib/api';
import {
  getSessionUser,
  getDashboardPath,
  setAuthRedirect,
  refreshSessionFromServer,
} from '../../lib/authRouting';

const SESSION_CHECK_MS = 15_000;

interface RequireAuthProps {
  children: ReactNode;
  allowedTypes?: UserType[];
}

function RedirectHome({ from }: { from: string }) {
  useEffect(() => {
    setAuthRedirect(from);
  }, [from]);

  return <Navigate to="/" replace />;
}

export function RequireAuth({ children, allowedTypes }: RequireAuthProps) {
  const location = useLocation();
  const [user, setUser] = useState(() => getSessionUser({ refresh: false }));
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const remote = await refreshSessionFromServer();
      if (cancelled) return;
      setUser(remote ?? getSessionUser({ refresh: false }));
      setChecking(false);
    })();

    const id = window.setInterval(() => {
      if (!cancelled) setUser(getSessionUser({ refresh: false }));
    }, SESSION_CHECK_MS);

    const onFocus = () => {
      void refreshSessionFromServer().then((remote) => {
        if (!cancelled) setUser(remote ?? getSessionUser({ refresh: false }));
      });
    };
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [location.pathname]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Verificando sesión…
      </div>
    );
  }

  if (!user) {
    return <RedirectHome from={location.pathname} />;
  }

  if (allowedTypes && !allowedTypes.includes(user.userType)) {
    return <Navigate to={getDashboardPath(user.userType)} replace />;
  }

  return children;
}
