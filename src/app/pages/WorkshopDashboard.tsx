import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Clock, LogOut, Menu, X, Wrench } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { clearUserSession, getSessionUser } from '../../lib/authRouting';
import { WorkshopAppointmentsView } from '../components/workshop/WorkshopAppointmentsView';
import { WorkshopAvailabilityView } from '../components/workshop/WorkshopAvailabilityView';
import { WorkshopNotificationBell } from '../components/workshop/WorkshopNotificationBell';

const menuItems = [
  { id: 'appointments', label: 'Citas', icon: Calendar },
  { id: 'availability', label: 'Disponibilidad', icon: Clock },
];

export function WorkshopDashboard() {
  const [activeView, setActiveView] = useState('appointments');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifRefresh, setNotifRefresh] = useState(0);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const user = getSessionUser();

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex transition-colors ${
      theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'
    }`}>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-[#0D0F2E] text-white' : 'bg-white text-gray-600'
        }`}
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#0D0F2E] to-[#0D1145] text-white'
            : 'bg-gradient-to-b from-gray-900 to-gray-800 text-white'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-blue-600/20">
            <div className="flex flex-col mb-2">
              <span className="text-3xl font-bold tracking-wide text-white">atoo</span>
              <span className="text-[10px] -mt-1 tracking-wider uppercase text-blue-400/60">
                Yours Tomorrow
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Panel de Taller
            </p>
          </div>

          <div className="p-6 border-b border-blue-600/20">
            <p className="font-semibold text-white truncate">{user?.email}</p>
            <p className="text-sm text-gray-400">Taller asociado</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
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
                      ? 'bg-[#1A1FE8] text-white shadow-[0_0_20px_rgba(26,31,232,0.4)]'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-blue-600/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 overflow-auto">
        <div className={`sticky top-0 z-20 border-b px-6 lg:px-8 py-4 ${
          theme === 'dark'
            ? 'bg-[#0D0F2E]/90 backdrop-blur-md border-blue-600/20'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-end">
            <WorkshopNotificationBell refreshKey={notifRefresh} />
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {activeView === 'appointments' && (
            <WorkshopAppointmentsView onUpdated={() => setNotifRefresh((k) => k + 1)} />
          )}
          {activeView === 'availability' && <WorkshopAvailabilityView />}
        </div>
      </main>
    </div>
  );
}
