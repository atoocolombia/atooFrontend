import type { RegisteredUser, UserType } from './api';
import {
  hasLocalApplicationInProgress,
  isApplicationCompleted,
} from './applicationProgress';
import { listUserDocuments } from './documentsApi';

const USER_SESSION_KEY = 'atooUserSession';
const AUTH_REDIRECT_KEY = 'atooAuthRedirect';
const LEGACY_USER_KEY = 'atooUser';

/** Duración de sesión activa (se renueva con cada uso). Prueba: 5 min. Producción: 12 * 60 * 60 * 1000 */
export const SESSION_TTL_MS = 5 * 60 * 1000;

interface StoredUserSession {
  user: RegisteredUser;
  expiresAt: number;
}

export function getDashboardPath(userType: UserType): string {
  switch (userType) {
    case 'ADMIN':
      return '/admin';
    case 'ADVISOR':
      return '/asesor';
    case 'ANALYST':
      return '/analista';
    default:
      return '/dashboard';
  }
}

function readStoredSession(): StoredUserSession | null {
  try {
    const raw = sessionStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredUserSession>;
    const user = parsed.user;
    if (
      !user ||
      typeof user.id !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.userType !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      return null;
    }
    return { user, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

function writeStoredSession(session: StoredUserSession): void {
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
}

export function persistUserSession(user: RegisteredUser): void {
  writeStoredSession({
    user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  sessionStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function clearUserSession(): void {
  sessionStorage.removeItem(USER_SESSION_KEY);
  sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  sessionStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function getSessionUser(options: { refresh?: boolean } = {}): RegisteredUser | null {
  const { refresh = true } = options;
  const stored = readStoredSession();
  if (!stored) {
    return null;
  }

  if (Date.now() > stored.expiresAt) {
    clearUserSession();
    return null;
  }

  if (refresh) {
    writeStoredSession({
      user: stored.user,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
  }

  return stored.user;
}

export function getSessionUserEmail(): string | null {
  const user = getSessionUser();
  return user?.email?.trim() ? user.email.trim() : null;
}

export function setAuthRedirect(path: string): void {
  sessionStorage.setItem(AUTH_REDIRECT_KEY, path);
}

export function consumeAuthRedirect(): string | null {
  const path = sessionStorage.getItem(AUTH_REDIRECT_KEY);
  sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  return path?.trim() ? path.trim() : null;
}

export function resolvePostAuthPath(user: RegisteredUser): string {
  const redirect = consumeAuthRedirect();
  if (redirect) return redirect;

  if (user.userType === 'USER' && hasLocalApplicationInProgress(user.id)) {
    return '/solicitud';
  }

  return getDashboardPath(user.userType);
}

/** Tras login, decide la ruta considerando progreso local y documentos en el servidor. */
export async function resolvePostAuthPathAsync(user: RegisteredUser): Promise<string> {
  const redirect = consumeAuthRedirect();
  if (redirect) return redirect;

  if (user.userType !== 'USER') {
    return getDashboardPath(user.userType);
  }

  if (isApplicationCompleted(user.id)) {
    return getDashboardPath(user.userType);
  }

  if (hasLocalApplicationInProgress(user.id)) {
    return '/solicitud';
  }

  try {
    const docs = await listUserDocuments(user.id);
    if (docs.length > 0) {
      return '/solicitud';
    }
  } catch {
    // Si falla el API, ir al dashboard por defecto
  }

  return getDashboardPath(user.userType);
}
