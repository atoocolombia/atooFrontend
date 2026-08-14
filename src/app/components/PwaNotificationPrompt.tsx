import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import { getSessionUser } from '../../lib/authRouting';
import { getAuthToken } from '../../lib/authTokenStorage';
import {
  dismissNotifPrompt,
  isAndroidDevice,
  isIosDevice,
  isNotifPromptDismissed,
  isStandalonePwa,
  notificationsSupported,
  subscribeAndSendTestPush,
} from '../../lib/pwaNotifications';

export function PwaNotificationPrompt() {
  const [hidden, setHidden] = useState(() => isNotifPromptDismissed());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<
    | 'idle'
    | 'subscribed'
    | 'denied'
    | 'need-standalone'
    | 'need-login'
    | 'unsupported'
    | 'not-configured'
  >('idle');

  if (hidden) return null;

  const ios = isIosDevice();
  const android = isAndroidDevice();
  const standalone = isStandalonePwa();
  const supported = notificationsSupported();
  const loggedIn = Boolean(getSessionUser({ refresh: false }) || getAuthToken());

  if (!ios && !android && !standalone) return null;

  const close = () => {
    dismissNotifPrompt();
    setHidden(true);
  };

  const onActivate = async () => {
    setBusy(true);
    const result = await subscribeAndSendTestPush();
    setStatus(result);
    setBusy(false);
  };

  const canActivate = supported && loggedIn && (standalone || !ios) && status !== 'subscribed';

  return (
    <div className="fixed bottom-0 inset-x-0 z-[75] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="mx-auto max-w-lg pointer-events-auto rounded-xl bg-[#1A1FE8] text-white shadow-lg px-4 py-3">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm flex-1 min-w-0">
            <p className="font-semibold">Avisos en el celular</p>
            {ios && !standalone ? (
              <p className="mt-1 leading-snug text-white/90">
                En Safari no llegan. Toca Compartir → Agregar a pantalla de inicio, abre Atoo
                desde el ícono, inicia sesión y activa los avisos.
              </p>
            ) : !loggedIn ? (
              <p className="mt-1 leading-snug text-white/90">
                Inicia sesión y luego activa los avisos. Así te llegarán citas y reagendamientos
                aunque no tengas Atoo abierta.
              </p>
            ) : !supported ? (
              <p className="mt-1 leading-snug text-white/90">
                Este iPhone necesita iOS 16.4 o posterior. Actualiza el sistema y abre Atoo desde
                el ícono.
              </p>
            ) : status === 'subscribed' ? (
              <p className="mt-1 leading-snug text-white/90">
                Listo. Te llegará un aviso de prueba. Desde ahora, lo que aparezca en la campana
                (cita, reagendamiento, revisión) también llega al celular con la app cerrada.
              </p>
            ) : status === 'denied' ? (
              <p className="mt-1 leading-snug text-white/90">
                Bloqueaste los avisos. En Ajustes → Notificaciones → atoo, actívalos y prueba otra
                vez.
              </p>
            ) : status === 'not-configured' ? (
              <p className="mt-1 leading-snug text-white/90">
                El servidor aún no tiene configurados los avisos. Hay que agregar las claves VAPID
                en Railway.
              </p>
            ) : (
              <p className="mt-1 leading-snug text-white/90">
                Actívalos una vez. Te avisaremos si reagendan una cita, hay una solicitud o llega
                algo a la campana, aunque no tengas la app abierta.
              </p>
            )}

            {canActivate ? (
              <button
                type="button"
                onClick={() => void onActivate()}
                disabled={busy}
                className="mt-3 rounded-lg bg-white text-[#1A1FE8] font-semibold text-sm px-3 py-2 disabled:opacity-60"
              >
                {busy ? 'Activando…' : 'Activar avisos en el celular'}
              </button>
            ) : null}

            {status === 'subscribed' ? (
              <button
                type="button"
                onClick={close}
                className="mt-3 rounded-lg bg-white/15 text-white font-semibold text-sm px-3 py-2"
              >
                Entendido
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={close}
            className="shrink-0 p-1 rounded-md text-white/80 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
