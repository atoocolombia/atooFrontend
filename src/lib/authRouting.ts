import type { RegisteredUser, UserType } from './api';
import { ApiError } from './api';
import {
  hasLocalApplicationInProgress,
  isApplicationCompleted,
} from './applicationProgress';
import { fetchAuthMe, logoutAuthSession } from './authApi';
import { clearAuthToken, getAuthToken } from './authTokenStorage';
import { listUserDocuments } from './documentsApi';
import { fetchClientAccess } from './clientAccessApi';

const USER_SESSION_KEY = 'atooUserSession';
const AUTH_REDIRECT_KEY = 'atooAuthRedirect';
const LEGACY_USER_KEY = 'atooUser';

/** Alineado con el JWT del backend. En iOS sessionStorage se borra al cerrar la PWA. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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
    case 'WORKSHOP':
      return '/taller';
    default:
      return '/dashboard';
  }
}

function readStorageItem(key: string): string | null {
  try {
    const fromSession = sessionStorage.getItem(key);
    if (fromSession) return fromSession;
  } catch {
    // Safari privado u origen sin storage
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageItem(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function removeStorageItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function readStoredSession(): StoredUserSession | null {
  try {
    const raw = readStorageItem(USER_SESSION_KEY);
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
  writeStorageItem(USER_SESSION_KEY, JSON.stringify(session));
}

function dropLocalSession(): void {
  removeStorageItem(USER_SESSION_KEY);
  removeStorageItem(AUTH_REDIRECT_KEY);
  removeStorageItem(LEGACY_USER_KEY);
}

export function persistUserSession(user: RegisteredUser): void {
  writeStoredSession({
    user,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  removeStorageItem(LEGACY_USER_KEY);
}

export async function clearUserSession(): Promise<void> {
  await logoutAuthSession();
  dropLocalSession();
}

export function getSessionUser(options: { refresh?: boolean } = {}): RegisteredUser | null {
  const { refresh = true } = options;
  const stored = readStoredSession();
  if (!stored) {
    return null;
  }

  if (Date.now() > stored.expiresAt) {
    if (!getAuthToken()) {
      dropLocalSession();
      return null;
    }
    // El JWT puede seguir vigente; no cerrar sesión solo por el reloj local.
  }

  if (refresh) {
    writeStoredSession({
      user: stored.user,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
  }

  return stored.user;
}

/** Valida la sesión JWT del servidor y sincroniza el almacenamiento local. */
export async function refreshSessionFromServer(): Promise<RegisteredUser | null> {
  try {
    const user = await fetchAuthMe();
    persistUserSession(user);
    return user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearAuthToken();
      dropLocalSession();
      return null;
    }
    return getSessionUser({ refresh: false });
  }
}

export function getSessionUserEmail(): string | null {
  const user = getSessionUser();
  return user?.email?.trim() ? user.email.trim() : null;
}

export function setAuthRedirect(path: string): void {
  writeStorageItem(AUTH_REDIRECT_KEY, path);
}

export function consumeAuthRedirect(): string | null {
  const path = readStorageItem(AUTH_REDIRECT_KEY);
  removeStorageItem(AUTH_REDIRECT_KEY);
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

/** Tras login, decide la ruta considerando progreso local, documentos y estado de entrega. */
export async function resolvePostAuthPathAsync(user: RegisteredUser): Promise<string> {
  const redirect = consumeAuthRedirect();
  if (redirect) return redirect;

  if (user.userType !== 'USER') {
    return getDashboardPath(user.userType);
  }

  try {
    const access = await fetchClientAccess(user.id);
    if (access.phase === 'dashboard') return '/dashboard';
    if (access.phase === 'waiting_delivery') return '/espera-entrega';
  } catch {
    // Si falla el API, continuar con heurísticas locales
  }

  if (hasLocalApplicationInProgress(user.id)) {
    return '/solicitud';
  }

  if (isApplicationCompleted(user.id)) {
    return '/espera-entrega';
  }

  try {
    const docs = await listUserDocuments(user.id);
    if (docs.length > 0) {
      return '/solicitud';
    }
  } catch {
    // Si falla el API, ir a solicitud por defecto
  }

  return '/solicitud';
}
