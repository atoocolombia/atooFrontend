import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  X,
  CheckCircle,
  CalendarClock,
  Satellite,
} from 'lucide-react';
import {
  fetchInspectionNotifications,
  markAllInspectionNotificationsRead,
  markInspectionNotificationRead,
  type UserNotificationItem,
} from '../../../lib/inspectionsApi';

interface Notification {
  id: string;
  type: 'inspection' | 'gps' | 'other';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  time: string;
  icon: typeof Bell;
  read: boolean;
}

interface NotificationBellProps {
  userId?: string;
  paymentStatus?: 'current' | 'warning' | 'critical';
  onOpenInspections?: () => void;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

function mapRemoteNotification(n: UserNotificationItem): Notification {
  const isUrgent = n.type.includes('urgent') || n.type.includes('procedure_authorization');
  const isSuccess =
    n.type.includes('accepted') ||
    n.type.includes('approved_immediate') ||
    n.type.includes('completed');
  const isGps = n.type.includes('gps');
  return {
    id: n.id,
    type: isGps ? 'gps' : 'inspection',
    severity: isUrgent ? 'warning' : isSuccess ? 'success' : 'info',
    title: n.title,
    message: n.message,
    time: formatRelativeTime(n.createdAt),
    icon: isGps ? Satellite : CalendarClock,
    read: n.read,
  };
}

export function NotificationBell({
  userId,
  onOpenInspections,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadRemote = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    try {
      const rows = await fetchInspectionNotifications(userId);
      setNotifications(rows.map(mapRemoteNotification));
    } catch {
      setNotifications([]);
    }
  }, [userId]);

  useEffect(() => {
    loadRemote();
  }, [loadRemote]);

  useEffect(() => {
    const onFocus = () => loadRemote();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadRemote]);

  useEffect(() => {
    if (!isOpen || !userId) return;
    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchInspectionNotifications(userId);
        if (cancelled) return;
        setNotifications(rows.map(mapRemoteNotification));
        if (rows.some((r) => !r.read)) {
          await markAllInspectionNotificationsRead(userId);
          if (cancelled) return;
          const refreshed = await fetchInspectionNotifications(userId);
          setNotifications(refreshed.map(mapRemoteNotification));
        }
      } catch {
        if (!cancelled) await loadRemote();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, userId, loadRemote]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
        };
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read && userId) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
      try {
        await markInspectionNotificationRead(userId, notification.id);
      } catch {
        // ignore
      }
    }
    if (notification.type === 'inspection' && onOpenInspections) {
      onOpenInspections();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />

          <div className="fixed top-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[101] max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Notificaciones</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Al abrir este panel, las novedades se marcan como leídas.
              </p>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No tienes notificaciones</p>
                  <p className="text-sm text-gray-400 mt-1">Te avisaremos cuando haya algo nuevo</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    const styles = getSeverityStyles(notification.severity);

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50/30' : ''
                        }`}
                        onClick={() => void handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${styles.bg} border ${styles.border}`}
                          >
                            <Icon className={`w-5 h-5 ${styles.icon}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-gray-400">{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
