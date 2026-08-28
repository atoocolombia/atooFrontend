/** Número de soporte Colombia (+57). Sin espacios ni + para wa.me */
const DEFAULT_NUMBER = '573136768862';

export function getWhatsAppSupportNumber(): string {
  const fromEnv = import.meta.env.VITE_WHATSAPP_SUPPORT_NUMBER?.replace(/\D/g, '');
  return fromEnv || DEFAULT_NUMBER;
}

/** Dispara el bot automático (requiere API de WhatsApp en Railway). */
export function getWhatsAppSupportStarterMessage(context: 'dashboard' | 'registration' | 'default' = 'default'): string {
  switch (context) {
    case 'dashboard':
      return 'Hola atoo';
    case 'registration':
      return 'Hola, acabo de registrarme en atoo';
    default:
      return 'Hola atoo';
  }
}

export function buildWhatsAppSupportUrl(context: 'dashboard' | 'registration' | 'default' = 'default'): string {
  const number = getWhatsAppSupportNumber();
  const text = getWhatsAppSupportStarterMessage(context);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
