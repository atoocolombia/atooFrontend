export class OfflineError extends Error {
  constructor(message = 'Sin conexión. Esta acción requiere internet. Inténtalo cuando vuelvas a tener red.') {
    super(message);
    this.name = 'OfflineError';
  }
}

export function isBrowserOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine;
}

export function assertOnlineForWrite(method?: string): void {
  const verb = (method ?? 'GET').toUpperCase();
  if (verb === 'GET' || verb === 'HEAD') return;
  if (!isBrowserOnline()) {
    throw new OfflineError();
  }
}
