import { DollarSign, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function FinancialReportsView() {
  const { theme } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyData = [
    { month: 'Enero 2026', expected: 142000000, collected: 138500000, pending: 3500000, rate: 97.5 },
    { month: 'Febrero 2026', expected: 145000000, collected: 143200000, pending: 1800000, rate: 98.8 },
    { month: 'Marzo 2026', expected: 148000000, collected: 145800000, pending: 2200000, rate: 98.5 },
    { month: 'Abril 2026', expected: 152000000, collected: 148900000, pending: 3100000, rate: 97.9 },
    { month: 'Mayo 2026', expected: 156000000, collected: 140400000, pending: 15600000, rate: 90.0 },
  ];

  const currentMonth = monthlyData[monthlyData.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Reportes Financieros</h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Análisis de ingresos y recaudación
          </p>
        </div>
        <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${theme === 'dark' ? 'bg-[#141638] text-white hover:bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
          <Download className="w-5 h-5" />
          Exportar Reporte
        </button>
      </div>

      {/* Current Month Summary */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Esperado - Mayo</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(currentMonth.expected)}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Recaudado</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(currentMonth.collected)}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Pendiente</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {formatCurrency(currentMonth.pending)}
          </p>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-700" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Tasa de Cobro</span>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{currentMonth.rate}%</p>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Comparativa Mensual</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b-2 ${theme === 'dark' ? 'border-[#1A1FE8]/20' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Mes</th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Esperado</th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Recaudado</th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Pendiente</th>
                <th className={`text-right py-3 px-4 text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tasa</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr key={index} className={`border-b transition-colors ${theme === 'dark' ? 'border-[#1A1FE8]/15 hover:bg-[#141638]' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <td className={`py-4 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{data.month}</td>
                  <td className={`py-4 px-4 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(data.expected)}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-green-600">
                    {formatCurrency(data.collected)}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-orange-600">
                    {formatCurrency(data.pending)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      data.rate >= 98 ? 'bg-green-100 text-green-700' :
                      data.rate >= 95 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {data.rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collection Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
          <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Análisis de Recaudación</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pagos Recibidos a Tiempo</p>
                <p className="text-2xl font-bold text-green-600">142</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">del total</p>
                <p className="text-xl font-bold text-gray-900">91%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pagos con Retraso</p>
                <p className="text-2xl font-bold text-orange-600">14</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">del total</p>
                <p className="text-xl font-bold text-gray-900">9%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Monto en Riesgo</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(15600000)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">del esperado</p>
                <p className="text-xl font-bold text-gray-900">10%</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
          <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Proyección Anual</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Ingresos Proyectados 2026</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(1750000000)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Recaudado Año a la Fecha</p>
              <p className="text-3xl font-bold text-blue-700">
                {formatCurrency(716800000)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Progreso Anual</span>
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>41%</span>
            </div>
            <div className={`h-4 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-100'}`}>
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-600 rounded-full"
                style={{ width: '41%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Distribution */}
      <div className={`${theme === 'dark' ? 'bg-[#0D0F2E] border border-[#1A1FE8]/20' : 'bg-white shadow-lg border border-gray-100'} rounded-2xl p-8`}>
        <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Métodos de Pago Utilizados</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { method: 'PSE', count: 78, percentage: 50 },
            { method: 'Tarjeta Crédito', count: 42, percentage: 27 },
            { method: 'Tarjeta Débito', count: 24, percentage: 15 },
            { method: 'Billeteras Digitales', count: 12, percentage: 8 },
          ].map((item) => (
            <div key={item.method} className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-[#141638]' : 'bg-gray-50'}`}>
              <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{item.method}</p>
              <p className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.count}</p>
              <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[#0D0F2E]' : 'bg-gray-200'}`}>
                <div
                  className={`h-full rounded-full ${theme === 'dark' ? 'bg-[#1A1FE8]' : 'bg-gray-900'}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
