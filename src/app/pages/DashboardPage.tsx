import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  LayoutDashboard,
  Car,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Loader2,
  Wrench,
  GraduationCap,
} from 'lucide-react';
import { ProgressView } from '../components/dashboard/ProgressView';
import { VehicleView } from '../components/dashboard/VehicleView';
import { PaymentsView } from '../components/dashboard/PaymentsView';
import { DocumentsView } from '../components/dashboard/DocumentsView';
import { InspectionsView } from '../components/dashboard/InspectionsView';
import { DashboardSupportChat } from '../components/dashboard/DashboardSupportChat';
import { TrainingVideosView } from '../components/dashboard/TrainingVideosView';
import { NotificationBell } from '../components/dashboard/NotificationBell';
import { ProfileSettingsView } from '../components/dashboard/ProfileSettingsView';
import { MobileAppBar } from '../components/MobileAppBar';
import { PushActivateChip } from '../components/PushActivateChip';
import { useTheme } from '../contexts/ThemeContext';
import { clearUserSession } from '../../lib/authRouting';
import { useUserProfile } from '../../lib/useUserProfile';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

const mobileSidebarScrollStyle = { WebkitOverflowScrolling: 'touch' as const };

const menuItems = [
  { id: 'progress', label: 'Mi Progreso', icon: LayoutDashboard },
  { id: 'vehicle', label: 'Mi Vehículo', icon: Car },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
  { id: 'inspections', label: 'Revisiones', icon: Wrench },
  { id: 'documents', label: 'Documentos', icon: FileText },
  { id: 'training', label: 'Capacitaciones', icon: GraduationCap },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

export function DashboardPage() {
  const [activeView, setActiveView] = useState('progress');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openSupportFromPush] = useState(
    () =>
      searchParams.get('openSupportChat') === '1' ||
      searchParams.get('openSupportChat') === 'true',
  );
  const { theme } = useTheme();
  const { profile, loading: profileLoading, reload: reloadProfile } = useUserProfile();

  useBodyScrollLock(isSidebarOpen);

  useEffect(() => {
    if (!openSupportFromPush) return;
    setSearchParams(
      (prev) => {
        prev.delete('openSupportChat');
        return prev;
      },
      { replace: true },
    );
  }, [openSupportFromPush, setSearchParams]);

  const displayName = profile?.displayName ?? 'Usuario';
  const userEmail = profile?.email ?? '';
  const userInitials = profile?.initials ?? 'U';

  // Estado de pago - En producción vendría del servidor
  // Opciones:
  // 'current' - Pago al día (sin sombreado)
  // 'warning' - Pago retrasado T+0 a T+6h (sombreado naranja + banner naranja)
  // 'critical' - Inmovilización inminente T+6h+ (sombreado rojo + banner rojo)
  const paymentStatus = 'current'; // 👈 Cambiar a 'warning' o 'critical' para probar el sombreado

  const handleLogout = () => {
    void clearUserSession().then(() => navigate('/'));
  };

  const getPageOverlay = () => {
    if (paymentStatus === 'critical') {
      return 'bg-red-500/10'; // Rojo para inmovilización inminente
    } else if (paymentStatus === 'warning') {
      return 'bg-orange-500/10'; // Naranja para pago retrasado
    }
    return '';
  };

  return (
    <div className={`min-h-screen flex transition-colors ${
      theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'
    }`}>
      {/* Support Button */}
      <DashboardSupportChat userId={profile?.id} openOnMount={openSupportFromPush} />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[100] lg:z-40 w-[min(100vw,16rem)] lg:w-64 h-[100dvh] max-h-[100dvh] overflow-hidden lg:h-auto lg:max-h-none transform transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#0D0F2E] to-[#0D1145] text-white'
            : 'bg-white border-r border-gray-200'
        }`}
      >
        <div
          className="flex flex-col h-full min-h-0"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div
            className={`shrink-0 p-4 lg:p-6 border-b ${
              theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'
            }`}
          >
            <div className="flex flex-col mb-1">
              <span
                className={`text-2xl lg:text-3xl font-bold tracking-wide ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: '600',
                  letterSpacing: '-0.02em',
                }}
              >
                atoo
              </span>
              <span
                className={`text-[10px] -mt-1 tracking-wider uppercase ${theme === 'dark' ? 'text-blue-400/60' : 'text-blue-700/60'}`}
              >
                Yours Tomorrow
              </span>
            </div>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Panel de Control
            </p>
          </div>

          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y"
            style={mobileSidebarScrollStyle}
          >
            <div
              className={`p-4 lg:p-6 border-b ${
                theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border-2 ${
                    theme === 'dark'
                      ? 'bg-[#1A1FE8]/20 border-[#1A1FE8] shadow-[0_0_15px_rgba(26,31,232,0.3)]'
                      : 'bg-blue-100 border-blue-600'
                  }`}
                >
                  <span
                    className={`font-bold text-lg ${theme === 'dark' ? 'text-[#1A1FE8]' : 'text-blue-700'}`}
                  >
                    {profileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : userInitials}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3
                    className={`font-semibold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    {profileLoading ? 'Cargando…' : displayName}
                  </h3>
                  <p
                    className={`text-sm truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {userEmail}
                  </p>
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
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-[#1A1FE8] text-white shadow-[0_0_20px_rgba(26,31,232,0.4)]'
                        : 'bg-[#1A1FE8] text-white'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-white/5'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
            </nav>

            <div
              className={`p-4 border-t ${
                theme === 'dark' ? 'border-blue-600/20' : 'border-gray-200'
              }`}
              style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))' }}
            >
              <button
                type="button"
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-red-600 hover:bg-red-50'
                }`}
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
      <main className="flex-1 overflow-auto relative">
        {/* Page Overlay for Payment Status */}
        {paymentStatus !== 'current' && (
          <div className={`absolute inset-0 ${getPageOverlay()} pointer-events-none z-0`} />
        )}

        {/* Header with Notification Bell */}
        <MobileAppBar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          right={
            <>
              <PushActivateChip />
              <NotificationBell
                userId={profile?.id}
                paymentStatus={paymentStatus}
                onOpenInspections={() => setActiveView('inspections')}
              />
            </>
          }
        >

          {/* Payment Status Banner */}
          {paymentStatus === 'critical' && (
            <div className="mt-4 bg-red-600 text-white rounded-lg p-4 flex items-center gap-3 shadow-lg">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🚨</span>
              </div>
              <div className="flex-1">
                <p className="font-bold">¡URGENTE! Vehículo será inmovilizado pronto</p>
                <p className="text-sm text-red-100">Tu pago está muy retrasado. Realiza el pago inmediatamente para evitar el apagado remoto.</p>
              </div>
              <button
                onClick={() => setActiveView('payments')}
                className="px-6 py-2 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                Pagar Ahora
              </button>
            </div>
          )}

          {paymentStatus === 'warning' && (
            <div className="mt-4 bg-orange-600 text-white rounded-lg p-4 flex items-center gap-3 shadow-lg">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="font-bold">Pago Vencido</p>
                <p className="text-sm text-orange-100">Tu cuota mensual está vencida. Evita cargos adicionales y paga lo antes posible.</p>
              </div>
              <button
                onClick={() => setActiveView('payments')}
                className="px-6 py-2 bg-white text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition-colors"
              >
                Pagar Ahora
              </button>
            </div>
          )}
        </MobileAppBar>

        <div className="p-6 lg:p-8 relative z-0">
          {activeView === 'progress' && <ProgressView />}
          {activeView === 'vehicle' && <VehicleView />}
          {activeView === 'payments' && <PaymentsView />}
          {activeView === 'inspections' && <InspectionsView />}
          {activeView === 'documents' && <DocumentsView clientName={displayName} />}
          {activeView === 'training' && <TrainingVideosView />}
          {activeView === 'settings' && (
            <ProfileSettingsView
              profile={profile}
              profileLoading={profileLoading}
              userEmail={userEmail}
              onProfileUpdated={() => void reloadProfile()}
            />
          )}
        </div>
      </main>
    </div>
  );
}
