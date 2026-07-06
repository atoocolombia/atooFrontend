import { useEffect, useState } from 'react';
import { Bell, X, AlertCircle, Calendar } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSessionUser } from '../../../lib/authRouting';
import {
  fetchWorkshopNotifications,
  type WorkshopNotification,
} from '../../../lib/workshopPortalApi';

interface WorkshopNotificationBellProps {
  refreshKey?: number;
}

export function WorkshopNotificationBell({ refreshKey = 0 }: WorkshopNotificationBellProps) {
  const { theme } = useTheme();
  const userId = getSessionUser()?.id ?? '';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<WorkshopNotification[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchWorkshopNotifications(userId);
        if (!cancelled) setNotifications(data);
      } catch {
        if (!cancelled) setNotifications([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshKey]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'hover:bg-white/10 text-white'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        aria-label="Notificaciones"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl border z-50 overflow-hidden ${
              theme === 'dark'
                ? 'bg-[#0D0F2E] border-blue-600/30'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              theme === 'dark' ? 'border-blue-600/20' : 'border-gray-100'
            }`}>
              <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Notificaciones
              </h3>
              <button type="button" onClick={() => setIsOpen(false)} className="p-1">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No hay notificaciones pendientes.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b last:border-0 ${
                      theme === 'dark' ? 'border-blue-600/10' : 'border-gray-50'
                    }`}
                  >
                    <div className="flex gap-3">
                      {n.type === 'request' ? (
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <Calendar className="w-5 h-5 text-[#1A1FE8] shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
