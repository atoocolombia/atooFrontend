import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import {
  dismissNotifPrompt,
  isIosDevice,
  isNotifPromptDismissed,
  isStandalonePwa,
  notificationsSupported,
  showAtooTestNotification,
} from '../../lib/pwaNotifications';

export function PwaNotificationPrompt() {
  const [hidden, setHidden] = useState(() => isNotifPromptDismissed());
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'shown' | 'denied' | 'need-standalone' | 'unsupported'>(
    'idle',
  );

  if (hidden) return null;

  const ios = isIosDevice();
  const standalone = isStandalonePwa();
  const supported = notificationsSupported();

  if (!ios && !standalone) return null;

  const close = () => {
    dismissNotifPrompt();
    setHidden(true);
  };

  const onTest = async () => {
    setBusy(true);
    const result = await showAtooTestNotification();
    setStatus(result);
    setBusy(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[75] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="mx-auto max-w-lg pointer-events-auto rounded-xl bg-[#1A1FE8] text-white shadow-lg px-4 py-3">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm flex-1 min-w-0">
            <p className="font-semibold">Probar aviso en el iPhone</p>
            {ios && !standalone ? (
              <p className="mt-1 leading-snug text-white/90">
                En Safari no llegan. Toca Compartir → Agregar a pantalla de inicio, abre Atoo
                desde el ícono y vuelve a este aviso.
              </p>
            ) : !supported ? (
              <p className="mt-1 leading-snug text-white/90">
                Este iPhone necesita iOS 16.4 o posterior para avisos. Actualiza el sistema y
                abre Atoo desde el ícono.
              </p>
            ) : status === 'shown' ? (
              <p className="mt-1 leading-snug text-white/90">
                Si viste la notificación, funciona. No hace falta volver a descargar desde Safari:
                el ícono se queda y la app se actualiza sola. Cierra Atoo del todo y ábrela de
                nuevo para traer cambios.
              </p>
            ) : status === 'denied' ? (
              <p className="mt-1 leading-snug text-white/90">
                Bloqueaste los avisos. En Ajustes → Notificaciones → atoo, actívalos y prueba otra
                vez.
              </p>
            ) : (
              <p className="mt-1 leading-snug text-white/90">
                Abre Atoo desde el ícono (no desde Safari), toca el botón y acepta el permiso.
              </p>
            )}

            {supported && standalone && status !== 'shown' ? (
              <button
                type="button"
                onClick={() => void onTest()}
                disabled={busy}
                className="mt-3 rounded-lg bg-white text-[#1A1FE8] font-semibold text-sm px-3 py-2 disabled:opacity-60"
              >
                {busy ? 'Enviando…' : 'Enviar aviso de prueba'}
              </button>
            ) : null}

            {status === 'shown' ? (
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
