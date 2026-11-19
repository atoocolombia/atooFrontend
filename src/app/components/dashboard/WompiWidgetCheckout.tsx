import { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { WompiWidgetSession } from '../../../lib/wompiApi';

/** Botón oficial Wompi según https://docs.wompi.co/docs/colombia/widget-checkout-web/ */
export function WompiWidgetCheckout({ session }: { session: WompiWidgetSession | null }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !session) return;

    host.innerHTML = '';
    const form = document.createElement('form');
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.setAttribute('data-render', 'button');
    script.setAttribute('data-public-key', session.publicKey);
    script.setAttribute('data-currency', session.currency);
    script.setAttribute('data-amount-in-cents', String(session.amountInCents));
    script.setAttribute('data-reference', session.reference);
    script.setAttribute('data-signature:integrity', session.integritySignature);
    script.setAttribute('data-redirect-url', session.redirectUrl);
    if (session.customerEmail) {
      script.setAttribute('data-customer-data:email', session.customerEmail);
    }
    if (session.customerFullName) {
      script.setAttribute('data-customer-data:full-name', session.customerFullName);
    }
    form.appendChild(script);
    host.appendChild(form);
  }, [session]);

  if (!session) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-6 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
        Preparando pago seguro…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 text-center">
        Monto a pagar: <strong>{session.amountCop.toLocaleString('es-CO')} COP</strong> (una sola cuota; el
        monto no se puede cambiar en pantalla).
      </p>
      <div ref={hostRef} className="flex justify-center min-h-[52px]" />
    </div>
  );
}