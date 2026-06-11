import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar,
  FileText,
  UserX,
  BarChart3,
  Car,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { AppointmentsView } from '../components/advisor/AppointmentsView';
import { DocumentGeneratorView } from '../components/advisor/DocumentGeneratorView';
import { RejectedUsersView } from '../components/advisor/RejectedUsersView';
import { MetricsView } from '../components/advisor/MetricsView';
import { VehiclesView } from '../components/advisor/VehiclesView';
import { useTheme } from '../contexts/ThemeContext';

const menuItems = [
  { id: 'metrics', label: 'Métricas', icon: BarChart3 },
  { id: 'appointments', label: 'Calendario de Entregas', icon: Calendar },
  { id: 'documents', label: 'Generador de Documentos', icon: FileText },
  { id: 'rejected', label: 'Usuarios Rechazados', icon: UserX },
  { id: 'vehicles', label: 'Vehículos Disponibles', icon: Car },
];

export function AdvisorDashboard() {
  const [activeView, setActiveView] = useState('metrics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex transition-colors ${
      theme === 'dark' ? 'bg-[#06071A]' : 'bg-gray-50'
    }`}>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg transition-colors ${
          theme === 'dark'
            ? 'bg-[#0D0F2E] text-white'
            : 'bg-white text-gray-600'
        }`}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar */}
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
          {/* Logo */}
          <div className="p-6 border-b border-blue-600/20">
            <div className="flex flex-col mb-2">
              <span className="text-3xl font-bold tracking-wide text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: '600', letterSpacing: '-0.02em' }}>atoo</span>
              <span className="text-[10px] -mt-1 tracking-wider uppercase text-blue-400/60">Yours Tomorrow</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Panel de Asesor</p>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-blue-600/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1A1FE8]/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-[#1A1FE8] shadow-[0_0_15px_rgba(26,31,232,0.3)]">
                <span className="text-[#1A1FE8] font-bold text-lg">AS</span>
              </div>
              <div>
                <h3 className="font-semibold">Asesor</h3>
                <p className="text-sm text-gray-400">asesor@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
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

          {/* Logout */}
          <div className="p-4 border-t border-blue-600/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {activeView === 'metrics' && <MetricsView />}
          {activeView === 'appointments' && <AppointmentsView />}
          {activeView === 'documents' && <DocumentGeneratorView />}
          {activeView === 'rejected' && <RejectedUsersView />}
          {activeView === 'vehicles' && <VehiclesView />}
        </div>
      </main>
    </div>
  );
}
