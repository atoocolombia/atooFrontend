import type { UserType } from './api';

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

export function persistUserSession(user: { id: string; email: string; userType: UserType; createdAt: string }) {
  sessionStorage.setItem('atooUser', JSON.stringify(user));
}
