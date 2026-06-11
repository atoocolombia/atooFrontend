import { FileText, Download, User, Car, DollarSign, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function DocumentGeneratorView() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    clientName: '',
    clientId: '',
    vehicleModel: 'Nammi EV 2026',
    vin: '',
    monthlyPayment: '207000',
    deposit: '2000000',
    totalMonths: '60',
    startDate: '',
  });

  const handleGenerate = (type: 'contract' | 'rights') => {
    console.log(`Generando ${type}:`, formData);
    alert(`Documento ${type === 'contract' ? 'Contrato' : 'Carta de Derechos'} generado exitosamente!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Generador de Documentos</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Crea contratos y documentos legales para clientes
        </p>
      </div>

      {/* Generator Form */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Información del Cliente y Vehículo
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <User className="w-5 h-5 text-[#1A1FE8]" />
              Datos del Cliente
            </h3>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Juan Pérez García"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Cédula/ID *
              </label>
              <input
                type="text"
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                placeholder="1234567890"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha de Inicio *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className={`font-semibold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Car className="w-5 h-5 text-[#1A1FE8]" />
              Datos del Vehículo
            </h3>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Modelo
              </label>
              <select
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              >
                <option>Nammi EV 2026</option>
                <option>Nammi EV Plus 2026</option>
                <option>Nammi SUV 2026</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                VIN *
              </label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                placeholder="LNBM2EV3XN1234567"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </div>
          </div>

          {/* Financial Terms */}
          <div className="md:col-span-2 grid md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Cuota Semanal (COP)
              </label>
              <input
                type="text"
                value={formData.monthlyPayment}
                onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Depósito Inicial (COP)
              </label>
              <input
                type="text"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Plazo (Meses)
              </label>
              <input
                type="text"
                value={formData.totalMonths}
                onChange={(e) => setFormData({ ...formData, totalMonths: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1A1FE8] focus:border-transparent outline-none ${theme === 'dark' ? 'border-[#1A1FE8]/30 bg-[#141638] text-white' : 'border-gray-300 bg-white text-gray-900'}`}
              />
            </div>
          </div>
        </div>

        {/* Document Options */}
        <div className={`border-t pt-6 ${theme === 'dark' ? 'border-[#1A1FE8]/20' : 'border-gray-200'}`}>
          <h3 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Generar Documentos</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => handleGenerate('contract')}
              className={`p-6 border-2 rounded-xl transition-all group ${theme === 'dark' ? 'border-[#1A1FE8]/30 hover:border-[#1A1FE8]/60 hover:bg-[#141638]' : 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-[#1A1FE8]/20 group-hover:bg-[#1A1FE8]/30' : 'bg-[#E8E9FD] group-hover:bg-indigo-200'}`}>
                  <FileText className="w-6 h-6 text-[#1A1FE8]" />
                </div>
                <div className="text-left">
                  <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Contrato Rent to Own</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Contrato completo del programa</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleGenerate('rights')}
              className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-6 h-6 text-blue-700" />
                </div>
                <div className="text-left">
                  <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Carta de Derechos y Deberes</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Documento de términos y condiciones</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Templates */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Plantillas Disponibles</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'Contrato Estándar', downloads: 156 },
            { name: 'Carta de Derechos', downloads: 142 },
            { name: 'Manual de Usuario', downloads: 128 },
          ].map((template, index) => (
            <div key={index} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{template.name}</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{template.downloads} descargas</p>
                </div>
                <Download className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
