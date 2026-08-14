const DISMISS_KEY = 'atooPwaNotifPromptDismissed';

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iPhoneOrPad = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iPhoneOrPad || iPadOs;
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function isNotifPromptDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissNotifPrompt(): void {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // ignore
  }
}

export type TestNotificationResult =
  | 'shown'
  | 'denied'
  | 'unsupported'
  | 'need-standalone';

export async function showAtooTestNotification(): Promise<TestNotificationResult> {
  if (!notificationsSupported()) return 'unsupported';
  if (isIosDevice() && !isStandalonePwa()) return 'need-standalone';

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') return 'denied';

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('atoo', {
    body: 'Tu app ya está instalada. Este es un aviso de prueba.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'atoo-test',
    data: { url: '/' },
  });
  return 'shown';
}
