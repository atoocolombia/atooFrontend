import { useEffect } from 'react';
import { refreshPushSubscriptionIfGranted } from '../../lib/pwaNotifications';

/** Si el usuario ya permitió avisos, vuelve a registrar el dispositivo al abrir la PWA. */
export function PwaPushBridge() {
  useEffect(() => {
    const refresh = () => {
      void refreshPushSubscriptionIfGranted().catch(() => {
        // ignore
      });
    };
    refresh();
    const id = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return null;
}
