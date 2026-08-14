import { Bell } from 'lucide-react';
import { useState } from 'react';
import { getSessionUser } from '../../lib/authRouting';
import { getAuthToken } from '../../lib/authTokenStorage';
import {
  isPushActivated,
  isStandalonePwa,
  notificationsSupported,
  subscribeAndSendTestPush,
} from '../../lib/pwaNotifications';
import { useTheme } from '../contexts/ThemeContext';

export function PushActivateChip() {
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(() => isPushActivated());
  const [error, setError] = useState('');

  if (hidden) return null;
  if (!getSessionUser({ refresh: false }) && !getAuthToken()) return null;
  if (!notificationsSupported()) return null;
  if (!isStandalonePwa() && /iPhone|iPad|iPod/i.test(navigator.userAgent)) return null;

  const onActivate = async () => {
    setBusy(true);
    setError('');
    const result = await subscribeAndSendTestPush();
    setBusy(false);
    if (result === 'subscribed') {
      setHidden(true);
      return;
    }
    if (result === 'denied') setError('Activa avisos en Ajustes');
    else if (result === 'not-configured') setError('Servidor sin avisos');
    else setError('No se pudieron activar');
  };

  return (
    <button
      type="button"
      onClick={() => void onActivate()}
      disabled={busy}
      className={`mr-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        theme === 'dark'
          ? 'bg-[#1A1FE8] text-white'
          : 'bg-[#1A1FE8] text-white'
      }`}
    >
      <span className="inline-flex items-center gap-1">
        <Bell className="w-3.5 h-3.5" />
        {busy ? 'Activando…' : error || 'Activar avisos'}
      </span>
    </button>
  );
}
