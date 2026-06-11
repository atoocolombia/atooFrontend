import { Calendar, Clock, User, Car, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function AppointmentsView() {
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState('2026-05-15');

  const appointments = [
    {
      id: 1,
      client: 'Juan Pérez',
      phone: '+57 300 123 4567',
      vehicle: 'Nammi EV 2026 - VIN: LNBM2EV3XN1234567',
      date: '2026-05-15',
      time: '10:00 AM',
      location: 'Sede Principal - Calle 100 #15-20',
      status: 'confirmed',
    },
    {
      id: 2,
      client: 'María González',
      phone: '+57 310 234 5678',
      vehicle: 'Nammi EV 2026 - VIN: LNBM2EV3XN1234568',
      date: '2026-05-15',
      time: '02:00 PM',
      location: 'Sede Principal - Calle 100 #15-20',
      status: 'confirmed',
    },
    {
      id: 3,
      client: 'Carlos Rodríguez',
      phone: '+57 320 345 6789',
      vehicle: 'Nammi EV 2026 - VIN: LNBM2EV3XN1234569',
      date: '2026-05-16',
      time: '11:30 AM',
      location: 'Sede Norte - Av. 68 #45-10',
      status: 'pending',
    },
  ];

  const filteredAppointments = appointments.filter(apt => apt.date === selectedDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Calendario de Entregas</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Gestiona las citas de entrega de vehículos a clientes
        </p>
      </div>

      {/* Date Selector */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-[#1A1FE8]" />
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Seleccionar Fecha</h2>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={`w-full md:w-auto px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none text-lg ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
        />
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Citas Hoy</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {filteredAppointments.length}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Esta Semana</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>8</p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-700" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Este Mes</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>23</p>
        </div>
      </div>

      {/* Appointments List */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Entregas del {new Date(selectedDate).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h2>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className={`w-16 h-16 mx-auto mb-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-300'}`} />
            <p className={`font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No hay citas para esta fecha</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`border-2 rounded-xl p-6 transition-colors ${theme === 'dark' ? 'border-[#1A1FE8]/20 hover:border-[#1A1FE8]/40' : 'border-gray-200 hover:border-indigo-300'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1A1FE8] to-[#3D42F0] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {appointment.client.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {appointment.client}
                      </h3>
                      <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <Phone className="w-4 h-4" />
                        {appointment.phone}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Car className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Vehículo</p>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{appointment.vehicle}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Hora</p>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{appointment.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 md:col-span-2">
                    <MapPin className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ubicación</p>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{appointment.location}</p>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t flex gap-3 ${theme === 'dark' ? 'border-[#1A1FE8]/20' : 'border-gray-200'}`}>
                  <button className="flex-1 px-4 py-2 bg-[#1A1FE8] text-white rounded-lg hover:bg-[#1217C8] transition-colors font-semibold">
                    Marcar como Entregado
                  </button>
                  <button className={`px-4 py-2 border-2 rounded-lg transition-colors font-semibold ${theme === 'dark' ? 'border-[#1A1FE8]/30 text-gray-300 hover:bg-[#141638]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    Contactar Cliente
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
