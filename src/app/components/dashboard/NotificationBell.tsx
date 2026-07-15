import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Shield,
  Gauge,
  CalendarClock,
} from 'lucide-react';
import {
  fetchInspectionNotifications,
  markInspectionNotificationRead,
  type UserNotificationItem,
} from '../../../lib/inspectionsApi';

interface Notification {
  id: string;
  type: 'payment' | 'insurance' | 'vehicle_use' | 'inspection';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  time: string;
  icon: typeof Bell;
  read: boolean;
  remote?: boolean;
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
  const isReschedule = n.type.startsWith('reschedule');
  return {
    id: n.id,
    type: 'inspection',
    severity: isReschedule ? 'warning' : 'success',
    title: n.title,
    message: n.message,
    time: formatRelativeTime(n.createdAt),
    icon: CalendarClock,
    read: n.read,
    remote: true,
  };
}

export function NotificationBell({
  userId,
  paymentStatus = 'current',
  onOpenInspections,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [remoteNotifications, setRemoteNotifications] = useState<Notification[]>([]);

  const loadRemote = useCallback(async () => {
    if (!userId) {
      setRemoteNotifications([]);
      return;
    }
    try {
      const rows = await fetchInspectionNotifications(userId);
      setRemoteNotifications(rows.map(mapRemoteNotification));
    } catch {
      setRemoteNotifications([]);
    }
  }, [userId]);

  useEffect(() => {
    loadRemote();
  }, [loadRemote]);

  const generateMockNotifications = (): Notification[] => {
    const baseNotifications: Notification[] = [
      {
        id: 'mock-insurance',
        type: 'insurance',
        severity: 'warning',
        title: 'Todoriesgo Próximo a Vencer',
        message:
          'Tu seguro Todoriesgo vence en 25 días (20 de Nov). Contáctanos para renovarlo y mantener tu cobertura.',
        time: 'Hace 5 horas',
        icon: Shield,
        read: false,
      },
      {
        id: 'mock-vehicle',
        type: 'vehicle_use',
        severity: 'warning',
        title: 'Exceso de Velocidad Detectado',
        message:
          'Detectamos que alcanzaste 130 km/h en zona de 80 km/h hoy a las 14:30. Por tu seguridad, conduce dentro de los límites.',
        time: 'Hace 3 horas',
        icon: Gauge,
        read: false,
      },
    ];

    if (paymentStatus === 'critical') {
      baseNotifications.unshift({
        id: 'mock-payment-critical',
        type: 'payment',
        severity: 'critical',
        title: 'VEHÍCULO SERÁ INMOVILIZADO',
        message:
          'Tu pago está muy retrasado. El vehículo será apagado remotamente si no pagas en las próximas horas. Contacta urgentemente a soporte.',
        time: 'Hace 15 minutos',
        icon: AlertCircle,
        read: false,
      });
    } else if (paymentStatus === 'warning') {
      baseNotifications.unshift({
        id: 'mock-payment-warning',
        type: 'payment',
        severity: 'warning',
        title: 'Pago Vencido',
        message:
          'Tu cuota venció y aún no hemos recibido tu pago. Por favor, realiza el pago lo antes posible para evitar cargos adicionales.',
        time: 'Hace 1 hora',
        icon: AlertTriangle,
        read: false,
      });
    } else {
      baseNotifications.unshift({
        id: 'mock-payment-info',
        type: 'payment',
        severity: 'info',
        title: 'Recordatorio de Pago',
        message:
          'Tu cuota semanal vence el próximo domingo. Realiza tu pago a tiempo para evitar inconvenientes.',
        time: 'Hace 2 horas',
        icon: Info,
        read: false,
      });
    }

    return baseNotifications;
  };

  const [localRead, setLocalRead] = useState<Record<string, boolean>>({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const mockNotifications = generateMockNotifications().filter((n) => !deletedIds.has(n.id));
  const mergedRemote = remoteNotifications
    .filter((n) => !deletedIds.has(n.id))
    .map((n) => ({ ...n, read: n.read || localRead[n.id] === true }));

  const notifications = [...mergedRemote, ...mockNotifications.map((n) => ({
    ...n,
    read: n.read || localRead[n.id] === true,
  }))];

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

  const markAsRead = async (notification: Notification) => {
    setLocalRead((prev) => ({ ...prev, [notification.id]: true }));
    if (notification.remote && userId) {
      try {
        await markInspectionNotificationRead(userId, notification.id);
        await loadRemote();
      } catch {
        // ignore
      }
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    setLocalRead((prev) => {
      const next = { ...prev };
      for (const n of unread) next[n.id] = true;
      return next;
    });
    if (userId) {
      await Promise.all(
        unread
          .filter((n) => n.remote)
          .map((n) => markInspectionNotificationRead(userId, n.id).catch(() => undefined)),
      );
      await loadRemote();
    }
  };

  const deleteNotification = (id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id));
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification);
    if (notification.type === 'inspection' && onOpenInspections) {
      onOpenInspections();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">Notificaciones</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Marcar todas como leídas
                </button>
              )}
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
                        onClick={() => handleNotificationClick(notification)}
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
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">{notification.time}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-xs text-gray-400 hover:text-red-600 font-medium"
                              >
                                Eliminar
                              </button>
                            </div>
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
