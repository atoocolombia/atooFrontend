const TOKEN_KEY = 'atoo_access_token';

export function getAuthToken(): string | null {
  try {
    const fromSession = sessionStorage.getItem(TOKEN_KEY)?.trim();
    if (fromSession) return fromSession;
    const fromLocal = localStorage.getItem(TOKEN_KEY)?.trim();
    return fromLocal || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  const value = token.trim();
  if (!value) return;
  try {
    sessionStorage.setItem(TOKEN_KEY, value);
    localStorage.setItem(TOKEN_KEY, value);
  } catch {
    // Safari privado u origen sin storage
  }
}

export function clearAuthToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function captureAuthTokenFromPayload(data: { token?: unknown }): void {
  if (typeof data.token === 'string' && data.token.trim()) {
    setAuthToken(data.token);
  }
}
