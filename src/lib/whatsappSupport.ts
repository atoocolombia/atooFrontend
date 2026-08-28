/** Número de soporte Colombia (+57). Sin espacios ni + para wa.me */
const DEFAULT_NUMBER = '573136768862';

export function getWhatsAppSupportNumber(): string {
  const fromEnv = import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER?.replace(/\D/g, '');
  return fromEnv || DEFAULT_NUMBER;
}

/** Mensaje que envía el cliente al abrir el chat (dispara el menú de bienvenida en WhatsApp Business). */
export function getWhatsAppSupportStarterMessage(context: 'dashboard' | 'registration' | 'default' = 'default'): string {
  switch (context) {
    case 'dashboard':
      return 'Hola, necesito soporte atoo.';
    case 'registration':
      return 'Hola, acabo de registrarme en atoo y tengo una duda.';
    default:
      return 'Hola, necesito soporte atoo.';
  }
}

export function buildWhatsAppSupportUrl(context: 'dashboard' | 'registration' | 'default' = 'default'): string {
  const number = getWhatsAppSupportNumber();
  const text = getWhatsAppSupportStarterMessage(context);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
