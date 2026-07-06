import { useEffect, useState } from 'react';
import { getSessionUser } from './authRouting';
import { fetchUserProfile, type UserProfile } from './userProfileApi';

function fallbackProfileFromSession(): UserProfile | null {
  const user = getSessionUser({ refresh: false });
  if (!user) return null;

  const local = user.email.split('@')[0] ?? '';
  const displayName =
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || user.email;

  const initials =
    displayName.trim().split(/\s+/).length >= 2
      ? displayName
          .trim()
          .split(/\s+/)
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : local.slice(0, 2).toUpperCase();

  return {
    id: user.id,
    email: user.email,
    firstName: '',
    lastName: '',
    displayName,
    initials,
    address: '',
    idDocumentNumber: '',
    phone: '',
  };
}

export function useUserProfile() {
  const sessionUser = getSessionUser();
  const [profile, setProfile] = useState<UserProfile | null>(() => fallbackProfileFromSession());
  const [loading, setLoading] = useState(Boolean(sessionUser));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const data = await fetchUserProfile(sessionUser.id);
        if (!cancelled) {
          setProfile(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setProfile(fallbackProfileFromSession());
          setError('No pudimos cargar tu perfil. Mostramos datos básicos de la sesión.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionUser?.id]);

  return { profile, loading, error };
}
