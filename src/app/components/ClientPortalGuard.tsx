import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import { getSessionUser } from '../../lib/authRouting';
import { fetchClientAccess, type ClientAccessState } from '../../lib/clientAccessApi';
import {
  hasLocalApplicationInProgress,
  isApplicationCompleted,
} from '../../lib/applicationProgress';

interface ClientPortalGuardProps {
  children: ReactNode;
}

function resolvePhase(access: ClientAccessState | null, userId: string): ClientAccessState['phase'] {
  if (access) return access.phase;
  if (hasLocalApplicationInProgress(userId)) return 'application';
  if (isApplicationCompleted(userId)) return 'waiting_delivery';
  return 'application';
}

export function ClientPortalGuard({ children }: ClientPortalGuardProps) {
  const location = useLocation();
  const user = getSessionUser();
  const [access, setAccess] = useState<ClientAccessState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.userType !== 'USER') {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void fetchClientAccess(user.id)
      .then((state) => {
        if (!cancelled) setAccess(state);
      })
      .catch(() => {
        if (!cancelled) setAccess(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, location.pathname]);

  if (!user || user.userType !== 'USER') {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
      </div>
    );
  }

  const phase = resolvePhase(access, user.id);
  const path = location.pathname;

  if (phase === 'dashboard' && path !== '/dashboard') {
    return <Navigate to="/dashboard" replace />;
  }

  if (phase === 'waiting_delivery' && path !== '/espera-entrega') {
    return <Navigate to="/espera-entrega" replace />;
  }

  if (phase === 'application' && path === '/dashboard') {
    return <Navigate to="/solicitud" replace />;
  }

  if (phase === 'application' && path === '/espera-entrega') {
    return <Navigate to="/solicitud" replace />;
  }

  return children;
}
