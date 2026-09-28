import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getSessionUser, refreshSessionFromServer } from '../../lib/authRouting';
import { getAuthToken } from '../../lib/authTokenStorage';
import { refreshPushSubscriptionIfGranted } from '../../lib/pwaNotifications';

/** Si el usuario ya permitió avisos, vuelve a registrar el dispositivo al abrir la PWA. */
export function PwaPushBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string } | undefined;
      if (data?.type !== 'atoo-push-navigate' || !data.url) return;
      const path = data.url.startsWith('http')
        ? `${new URL(data.url).pathname}${new URL(data.url).search}`
        : data.url;
      navigate(path);
    };
    navigator.serviceWorker?.addEventListener('message', onMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage);
  }, [navigate]);

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
