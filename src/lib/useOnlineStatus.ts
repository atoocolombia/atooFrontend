import { useEffect, useState } from 'react';
import { isBrowserOnline } from './offline';

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(isBrowserOnline);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}
