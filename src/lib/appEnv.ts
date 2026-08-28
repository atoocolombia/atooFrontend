/** Sitio que ven los clientes. */
export function isCustomerProductionHost(hostname = window.location.hostname): boolean {
  return hostname === 'atoo.io' || hostname === 'www.atoo.io';
}

/** Previews de Vercel o el dominio de pruebas. */
export function isStagingHost(hostname = window.location.hostname): boolean {
  if (import.meta.env.VITE_APP_ENV === 'staging') return true;
  if (hostname === 'staging.atoo.io' || hostname === 'www.staging.atoo.io') return true;
  return hostname.endsWith('.vercel.app');
}

export function shouldShowStagingBanner(): boolean {
  if (typeof window === 'undefined') return false;
  if (isCustomerProductionHost()) return false;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return false;
  }
  return isStagingHost();
}
