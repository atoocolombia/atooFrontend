import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCircle2, Loader2, Wrench, X } from 'lucide-react';
import {
  adminFetchNotifications,
  adminMarkNotificationRead,
  type AdminNotificationItem,
} from '../../../lib/adminInspectionsApi';
import { useTheme } from '../../contexts/ThemeContext';

interface AdminNotificationBellProps {
  onOpenProcedures: () => void;
}

function relativeTime(value: string): string {
  const elapsed = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(elapsed / 60_000));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${Math.floor(hours / 24)} d`;
}

export function AdminNotificationBell({ onOpenProcedures }: AdminNotificationBellProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);

  const load = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      setNotifications(await adminFetchNotifications());
    } catch {
      // La sección de procedimientos seguirá mostrando la solicitud aunque falle la campana.
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(true);
    const interval = window.setInterval(() => void load(), 15_000);
    const handleFocus = () => void load();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [load]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const openNotification = async (item: AdminNotificationItem) => {
    if (!item.read) {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id ? { ...notification, read: true } : notification,
        ),
      );
      try {
        await adminMarkNotificationRead(item.id);
      } catch {
        // Se mantiene la navegación aunque no se pueda marcar como leída.
      }
    }
    if (item.type === 'procedure_authorization') onOpenProcedures();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative p-2.5 rounded-xl border shadow-sm ${
          theme === 'dark'
            ? 'bg-[#0D0F2E] border-blue-600/30 text-white'
            : 'bg-white border-gray-200 text-gray-700'
        }`}
        aria-label="Notificaciones del administrador"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`absolute right-0 top-12 z-[70] w-[min(24rem,calc(100vw-2rem))] rounded-2xl border shadow-xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-[#0D0F2E] border-blue-600/30 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-500/15">
            <div>
              <h3 className="font-bold">Notificaciones</h3>
              <p className="text-xs text-gray-500">{unreadCount} sin leer</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="p-1 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#1A1FE8]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay notificaciones.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void openNotification(item)}
                  className={`w-full text-left px-4 py-3 border-b last:border-0 border-gray-500/10 hover:bg-[#1A1FE8]/5 ${
                    !item.read ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="mt-0.5 w-9 h-9 rounded-lg bg-[#1A1FE8]/15 text-[#1A1FE8] flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-start gap-2">
                        <strong className="text-sm flex-1">{item.title}</strong>
                        {!item.read && <span className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0" />}
                      </span>
                      <span className="block text-xs text-gray-500 mt-1">{item.message}</span>
                      <span className="block text-[11px] text-gray-400 mt-1">
                        {relativeTime(item.createdAt)}
                      </span>
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
