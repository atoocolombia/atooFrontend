import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  LogOut,
  PlusCircle,
  CreditCard,
  Calendar,
  FileText,
  UserX,
  BarChart3,
  Car,
  Truck,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { clearUserSession, getSessionUser } from '../../lib/authRouting';
import { MobileAppBar } from '../components/MobileAppBar';
import { PendingApplicationsLiveView } from '../components/analyst/PendingApplicationsLiveView';
import { ManualDeliveryView } from '../components/analyst/ManualDeliveryView';
import { ApprovedApplicationsView } from '../components/analyst/ApprovedApplicationsView';
import { RejectedApplicationsView } from '../components/analyst/RejectedApplicationsView';
import { PaymentRegistrationView } from '../components/analyst/PaymentRegistrationView';
import { AppointmentsView } from '../components/advisor/AppointmentsView';
import { DocumentGeneratorView } from '../components/advisor/DocumentGeneratorView';
import { RejectedUsersView } from '../components/advisor/RejectedUsersView';
import { MetricsView } from '../components/advisor/MetricsView';
import { VehiclesView } from '../components/advisor/VehiclesView';
import { DeliveryQueueView } from '../components/advisor/DeliveryQueueView';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

const mobileSidebarScrollStyle = { WebkitOverflowScrolling: 'touch' as const };

const menuItems = [
  { id: 'pending', label: 'Solicitudes pendientes', icon: ClipboardCheck },
  { id: 'manual-delivery', label: 'Alta manual entrega', icon: PlusCircle },
  { id: 'payments', label: 'Registro de pagos', icon: CreditCard },
  { id: 'approved', label: 'Solicitudes aprobadas', icon: CheckCircle },
  { id: 'rejected-applications', label: 'Solicitudes denegadas', icon: XCircle },
  { id: 'deliveries', label: 'Entregas de vehículos', icon: Truck },
  { id: 'metrics', label: 'Métricas', icon: BarChart3 },
  { id: 'appointments', label: 'Calendario de entregas', icon: Calendar },
  { id: 'documents', label: 'Generador de documentos', icon: FileText },
  { id: 'rejected-users', label: 'Usuarios rechazados', icon: UserX },
  { id: 'vehicles', label: 'Vehículos disponibles', icon: Car },
];

export function AnalystDashboard() {
  const [activeView, setActiveView] = useState('pending');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const sessionUser = getSessionUser({ refresh: false });
  const email = sessionUser?.email ?? 'analista@atoo.com';

  useBodyScrollLock(isSidebarOpen);

  const handleLogout = () => {
    void clearUserSession().then(() => navigate('/'));
  };

  return (
    <div
      className={`min-h-screen flex transition-colors ${
        theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'
      }`}
    >
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[100] lg:z-40 w-[min(100vw,16rem)] lg:w-64 h-[100dvh] max-h-[100dvh] overflow-hidden lg:h-auto lg:max-h-none transition-all duration-300 ${
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
            <p className="text-sm text-gray-400 mt-1">Panel de analista</p>
          </div>

          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y"
            style={mobileSidebarScrollStyle}
          >
            <div className="p-4 lg:p-6 border-b border-blue-600/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#1A1FE8]/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-[#1A1FE8] shadow-[0_0_15px_rgba(26,31,232,0.3)]">
                  <span className="text-[#1A1FE8] font-bold text-lg">AN</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">Analista</h3>
                  <p className="text-sm text-gray-400 truncate">{email}</p>
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
                  type="button"
                  onClick={() => {
                    setActiveView(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#1A1FE8] text-white shadow-[0_0_20px_rgba(26,31,232,0.4)]'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-left text-sm">{item.label}</span>
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
                <span className="font-medium">Cerrar sesión</span>
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

      <main className="flex-1 overflow-auto min-w-0">
        <MobileAppBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="p-6 lg:p-8">
          {activeView === 'pending' && <PendingApplicationsLiveView />}
          {activeView === 'manual-delivery' && <ManualDeliveryView />}
          {activeView === 'payments' && <PaymentRegistrationView />}
          {activeView === 'approved' && <ApprovedApplicationsView />}
          {activeView === 'rejected-applications' && <RejectedApplicationsView />}
          {activeView === 'deliveries' && <DeliveryQueueView />}
          {activeView === 'metrics' && <MetricsView />}
          {activeView === 'appointments' && <AppointmentsView />}
          {activeView === 'documents' && <DocumentGeneratorView />}
          {activeView === 'rejected-users' && <RejectedUsersView />}
          {activeView === 'vehicles' && <VehiclesView />}
        </div>
      </main>
    </div>
  );
}
