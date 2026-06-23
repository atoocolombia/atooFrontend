import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { UserType } from '../../lib/api';
import { getSessionUser, setAuthRedirect } from '../../lib/authRouting';

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
  const [user, setUser] = useState(() => getSessionUser());

  useEffect(() => {
    const sync = (refresh: boolean) => setUser(getSessionUser({ refresh }));
    sync(true);
    const id = window.setInterval(() => sync(false), SESSION_CHECK_MS);
    const onFocus = () => sync(true);
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [location.pathname]);

  if (!user) {
    return <RedirectHome from={location.pathname} />;
  }

  if (allowedTypes && !allowedTypes.includes(user.userType)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
