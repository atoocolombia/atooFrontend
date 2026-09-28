import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  LayoutDashboard,
  Car,
  AlertTriangle,
  Lock,
  DollarSign,
  Users,
  LogOut,
  LayoutTemplate,
  Wrench,
  ClipboardCheck,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import { AdminMetricsView } from '../components/admin/AdminMetricsView';
import { DeliveredVehiclesView } from '../components/admin/DeliveredVehiclesView';
import { PaymentRiskView } from '../components/admin/PaymentRiskView';
import { RetainedVehiclesView } from '../components/admin/RetainedVehiclesView';
import { FinancialReportsView } from '../components/admin/FinancialReportsView';
import { ActiveUsersView } from '../components/admin/ActiveUsersView';
import { LandingAdminView } from '../components/admin/LandingAdminView';
import { WorkshopsAdminView } from '../components/admin/WorkshopsAdminView';
import { ProceduresAdminView } from '../components/admin/ProceduresAdminView';
import { TrainingVideosAdminView } from '../components/admin/TrainingVideosAdminView';
import { SupportChatsAdminView } from '../components/admin/SupportChatsAdminView';
import { AdminNotificationBell } from '../components/admin/AdminNotificationBell';
import { MobileAppBar } from '../components/MobileAppBar';
import { useTheme } from '../contexts/ThemeContext';
import { clearUserSession, getSessionUser } from '../../lib/authRouting';
import { adminFetchProcedureSuggestions } from '../../lib/adminInspectionsApi';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

const mobileSidebarScrollStyle = { WebkitOverflowScrolling: 'touch' as const };

const menuItems = [
  { id: 'metrics', label: 'Dashboard General', icon: LayoutDashboard },
  { id: 'landing', label: 'Landing Page', icon: LayoutTemplate },
  { id: 'workshops', label: 'Talleres', icon: Wrench },
  { id: 'procedures', label: 'Procedimientos', icon: ClipboardCheck },
  { id: 'training', label: 'Capacitaciones', icon: GraduationCap },
  { id: 'support-chats', label: 'Chats soporte', icon: MessageCircle },
  { id: 'delivered', label: 'Vehículos Entregados', icon: Car },
  { id: 'risk', label: 'Pagos en Riesgo', icon: AlertTriangle },
  { id: 'retained', label: 'Vehículos Retenidos', icon: Lock },
  { id: 'financial', label: 'Reportes Financieros', icon: DollarSign },
  { id: 'users', label: 'Usuarios Activos', icon: Users },
];

export function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chatFromEmail = searchParams.get('supportChat');
  const [activeView, setActiveView] = useState(() =>
    chatFromEmail ? 'support-chats' : 'metrics',
  );
  const [supportChatFocusId, setSupportChatFocusId] = useState<string | null>(chatFromEmail);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingProcedureCount, setPendingProcedureCount] = useState(0);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const sessionUser = getSessionUser({ refresh: false });
  const adminEmail = sessionUser?.email ?? 'admin';
  const adminInitials = adminEmail.slice(0, 2).toUpperCase();

  useBodyScrollLock(isSidebarOpen);

  const refreshPendingProcedures = useCallback(async () => {
    try {
      const pending = await adminFetchProcedureSuggestions('PENDING_ADMIN');
      setPendingProcedureCount(pending.length);
    } catch {
      // La vista correspondiente mostrará el error detallado si el admin la abre.
    }
  }, []);

  useEffect(() => {
    const id = searchParams.get('supportChat');
    if (id) {
      setActiveView('support-chats');
      setSupportChatFocusId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    void refreshPendingProcedures();
    const interval = window.setInterval(() => void refreshPendingProcedures(), 15_000);
    const handleFocus = () => void refreshPendingProcedures();
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshPendingProcedures]);

  const handleLogout = () => {
    void clearUserSession().then(() => navigate('/'));
  };

  return (
    <div className={`min-h-screen flex transition-colors ${
      theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[100] lg:z-40 w-[min(100vw,16rem)] lg:w-64 h-[100dvh] max-h-[100dvh] overflow-hidden lg:h-auto lg:max-h-none transform transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#0D0F2E] to-[#0D1145] text-white'
            : 'bg-gradient-to-b from-gray-900 to-gray-800 text-white'
        }`}
      >
        <div
          className="flex flex-col h-full min-h-0"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="shrink-0 p-4 lg:p-6 border-b border-blue-600/20">
            <div className="flex flex-col mb-1">
              <span
                className="text-2xl lg:text-3xl font-bold tracking-wide text-white"
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: '600',
                  letterSpacing: '-0.02em',
                }}
              >
                atoo
              </span>
              <span className="text-[10px] -mt-1 tracking-wider uppercase text-blue-400/60">
                Yours Tomorrow
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Panel Administrativo</p>
          </div>

          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y"
            style={mobileSidebarScrollStyle}
          >
            <div className="p-4 lg:p-6 border-b border-blue-600/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1A1FE8]/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-[#1A1FE8] shadow-[0_0_15px_rgba(26,31,232,0.3)]">
                  <span className="text-[#1A1FE8] font-bold text-lg">{adminInitials}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">Administrador</h3>
                  <p className="text-sm text-gray-400 break-all">{adminEmail}</p>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsSidebarOpen(false);
                    if (item.id !== 'support-chats') {
                      setSupportChatFocusId(null);
                      if (searchParams.has('supportChat')) {
                        const next = new URLSearchParams(searchParams);
                        next.delete('supportChat');
                        setSearchParams(next, { replace: true });
                      }
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#1A1FE8] text-white shadow-[0_0_20px_rgba(26,31,232,0.4)]'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {(item.id === 'workshops' || item.id === 'procedures') &&
                    pendingProcedureCount > 0 && (
                      <span className="ml-auto min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                        {pendingProcedureCount > 9 ? '9+' : pendingProcedureCount}
                      </span>
                    )}
                </button>
              );
            })}
            </nav>

            <div
              className="p-4 border-t border-blue-600/20"
              style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
            >
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-[90]"
          role="presentation"
        />
      )}

      {/* Main Content */}
      <main className="relative flex-1 overflow-auto">
        <MobileAppBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          right={
            <AdminNotificationBell onOpenProcedures={() => setActiveView('procedures')} />
          }
        />
        <div className="p-6 lg:p-8">
          {activeView === 'metrics' && <AdminMetricsView />}
          {activeView === 'landing' && <LandingAdminView />}
          {activeView === 'workshops' && (
            <div className="space-y-6">
              {pendingProcedureCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveView('procedures')}
                  className="w-full rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-left text-orange-800 flex items-center justify-between gap-3 hover:bg-orange-100"
                >
                  <span>
                    <strong>
                      {pendingProcedureCount}{' '}
                      {pendingProcedureCount === 1
                        ? 'solicitud pendiente del taller'
                        : 'solicitudes pendientes de talleres'}
                    </strong>
                    <span className="block text-sm mt-0.5">
                      Revisa y autoriza los procedimientos sugeridos.
                    </span>
                  </span>
                  <span className="text-sm font-semibold shrink-0">Ver solicitudes →</span>
                </button>
              )}
              <WorkshopsAdminView />
            </div>
          )}
          {activeView === 'procedures' && (
            <ProceduresAdminView onPendingCountChange={setPendingProcedureCount} />
          )}
          {activeView === 'training' && <TrainingVideosAdminView />}
          {activeView === 'support-chats' && (
            <SupportChatsAdminView initialSessionId={supportChatFocusId} />
          )}
          {activeView === 'delivered' && <DeliveredVehiclesView />}
          {activeView === 'risk' && <PaymentRiskView />}
          {activeView === 'retained' && <RetainedVehiclesView />}
          {activeView === 'financial' && <FinancialReportsView />}
          {activeView === 'users' && <ActiveUsersView />}
        </div>
      </main>
    </div>
  );
}
