import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../lib/useOnlineStatus';

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[80] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="mx-auto max-w-lg pointer-events-auto rounded-xl bg-amber-500 text-amber-950 shadow-lg px-4 py-3 flex items-start gap-3">
        <WifiOff className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">Sin conexión</p>
          <p className="mt-0.5 leading-snug">
            Puedes ver la landing, citas e historial ya cargados. Agendar, pagar o enviar documentos requiere internet.
          </p>
        </div>
      </div>
    </div>
  );
}
