import type { RegisteredUser, UserType } from './api';

const USER_STORAGE_KEY = 'atooUser';
const AUTH_REDIRECT_KEY = 'atooAuthRedirect';

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

export function persistUserSession(user: RegisteredUser): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearUserSession(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

export function getSessionUser(): RegisteredUser | null {
  try {
    const raw =
      localStorage.getItem(USER_STORAGE_KEY) ?? sessionStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as RegisteredUser;
    if (
      typeof user.id === 'string' &&
      typeof user.email === 'string' &&
      typeof user.userType === 'string'
    ) {
      return user;
    }
    return null;
  } catch {
    return null;
  }
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
  return getDashboardPath(user.userType);
}
