import { getSessionUser } from './authRouting';
import { fetchPushConfig, savePushSubscription, sendPushTest } from './pushApi';

const DISMISS_KEY = 'atooPwaNotifPromptDismissed';

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iPhoneOrPad = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iPhoneOrPad || iPadOs;
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
}

export function notificationsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export type PushSubscribeResult =
  | 'subscribed'
  | 'denied'
  | 'unsupported'
  | 'need-standalone'
  | 'need-login'
  | 'not-configured';

export async function subscribeDeviceToPush(): Promise<PushSubscribeResult> {
  if (!notificationsSupported()) return 'unsupported';
  if (isIosDevice() && !isStandalonePwa()) return 'need-standalone';
  if (!getSessionUser({ refresh: false })) return 'need-login';

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') return 'denied';

  const config = await fetchPushConfig();
  if (!config.publicKey) return 'not-configured';

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey) as BufferSource,
    });
  }

  await savePushSubscription(subscription.toJSON());
  return 'subscribed';
}

export async function subscribeAndSendTestPush(): Promise<PushSubscribeResult> {
  const result = await subscribeDeviceToPush();
  if (result === 'subscribed') {
    try {
      await sendPushTest();
    } catch {
      // La suscripción quedó; el aviso de prueba puede fallar si Railway aún no tiene VAPID.
    }
  }
  return result;
}

/** Reenvía la suscripción si el usuario ya dio permiso (iOS a veces la pierde). */
export async function refreshPushSubscriptionIfGranted(): Promise<void> {
  if (!notificationsSupported()) return;
  if (Notification.permission !== 'granted') return;
  if (isIosDevice() && !isStandalonePwa()) return;
  if (!getSessionUser({ refresh: false })) return;
  await subscribeDeviceToPush();
}
