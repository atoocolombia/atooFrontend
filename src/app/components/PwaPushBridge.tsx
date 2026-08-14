import { useEffect } from 'react';
import { getSessionUser, refreshSessionFromServer } from '../../lib/authRouting';
import { getAuthToken } from '../../lib/authTokenStorage';
import { refreshPushSubscriptionIfGranted } from '../../lib/pwaNotifications';

/** Si el usuario ya permitió avisos, vuelve a registrar el dispositivo al abrir la PWA. */
export function PwaPushBridge() {
  useEffect(() => {
    const refresh = () => {
      void (async () => {
        if (!getSessionUser({ refresh: false }) && getAuthToken()) {
          await refreshSessionFromServer();
        }
        await refreshPushSubscriptionIfGranted();
      })().catch(() => {
        // ignore
      });
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    const id = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return null;
}
