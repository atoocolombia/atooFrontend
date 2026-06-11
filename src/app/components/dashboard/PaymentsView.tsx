import { useState } from 'react';
import {
  CreditCard,
  Wallet,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export function PaymentsView() {
  const { theme } = useTheme();

  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showWompiWidget, setShowWompiWidget] = useState(false);
  const [paymentType, setPaymentType] = useState<'weekly' | 'deposit'>('weekly');

  const weeklyPayment = 207000; // Pago semanal (aproximadamente 900000/4.33)
  const depositAmount = 2000000; // Depósito inicial
  const nextPaymentDate = '2026-06-08'; // Próximo domingo
  const depositPaid = true; // Si ya pagó el depósito
  const depositDate = '2026-01-15'; // Fecha en que se pagó el depósito

  // Historial de pagos simulado
  const paymentHistory = [
    { date: '2026-06-01', amount: 207000, status: 'completed', method: 'Tarjeta de Crédito' },
    { date: '2026-05-25', amount: 207000, status: 'completed', method: 'PSE' },
    { date: '2026-05-18', amount: 207000, status: 'completed', method: 'Nequi' },
    { date: '2026-05-11', amount: 207000, status: 'completed', method: 'Tarjeta de Débito' },
  ];

  const paymentMethods = [
    {
      id: 'credit',
      name: 'Tarjeta de Crédito',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      color: 'blue',
    },
    {
      id: 'debit',
      name: 'Tarjeta de Débito',
      icon: CreditCard,
      description: 'Débito nacional e internacional',
      color: 'green',
    },
    {
      id: 'pse',
      name: 'PSE',
      icon: Building2,
      description: 'Pago seguro en línea',
      color: 'blue',
    },
    {
      id: 'digital',
      name: 'Carteras Digitales',
      icon: Wallet,
      description: 'Nequi, Daviplata, PayPal',
      color: 'orange',
    },
  ];

  const handlePaymentMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setShowWompiWidget(true);
  };

  const getCurrentPaymentAmount = () => {
    return paymentType === 'weekly' ? weeklyPayment : depositAmount;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pagos</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Gestiona tus pagos semanales y revisa tu historial
        </p>
      </div>

      {/* Payment Type Tabs */}
      <div className={`flex gap-3 rounded-2xl p-2 shadow-lg transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border border-blue-600/20 backdrop-blur-xl' : 'bg-white'}`}>
        <button
          onClick={() => {
            setPaymentType('weekly');
            setShowWompiWidget(false);
            setSelectedMethod('');
          }}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
            paymentType === 'weekly'
              ? 'bg-blue-600 text-white shadow-lg'
              : theme === 'dark'
                ? 'text-gray-400 hover:bg-white/5'
                : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          💳 Cuota Semanal
        </button>
        <button
          onClick={() => {
            setPaymentType('deposit');
            setShowWompiWidget(false);
            setSelectedMethod('');
          }}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
            paymentType === 'deposit'
              ? 'bg-blue-600 text-white shadow-lg'
              : theme === 'dark'
                ? 'text-gray-400 hover:bg-white/5'
                : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          🏦 Depósito Inicial
        </button>
      </div>

      {/* Next Payment Card */}
      {paymentType === 'weekly' ? (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Próximo Pago Semanal</h2>
              <p className="text-blue-100">Vencimiento: {nextPaymentDate}</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            <span className="text-sm font-semibold">Pago Semanal</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-blue-100 mb-2 flex items-center gap-2">
            <span>Cuota de esta semana</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Semana 1-7 Jun 2026</span>
          </p>
          <p className="text-5xl font-bold">{formatCurrency(weeklyPayment)}</p>
          <p className="text-blue-100 text-sm mt-2">Se cobra cada domingo</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-sm mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-blue-100">Tiempo restante</span>
            </div>
            <p className="text-2xl font-bold">7 días</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center gap-2 text-sm mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-blue-100">Frecuencia</span>
            </div>
            <p className="text-2xl font-bold">Semanal</p>
          </div>
        </div>
      </div>
      ) : (
        <div className="bg-gradient-to-br from-[#1A1FE8] to-[#3D42F0] rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Depósito Inicial</h2>
                <p className="text-blue-100">
                  {depositPaid ? 'Pagado el ' + depositDate : 'Requerido para iniciar'}
                </p>
              </div>
            </div>
            {depositPaid ? (
              <div className="bg-green-500 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">Pagado</span>
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <span className="text-sm font-semibold">Pendiente</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-blue-100 mb-2">Monto del Depósito</p>
            <p className="text-5xl font-bold">{formatCurrency(depositAmount)}</p>
            <p className="text-blue-100 text-sm mt-2">Pago único al inicio del contrato</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 mb-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <span>💡</span>
              ¿Qué pasa con mi depósito?
            </h3>
            <p className="text-blue-50 leading-relaxed">
              Este depósito es <strong>reembolsable</strong> y se aplicará automáticamente
              como parte del pago final de tu vehículo al completar los 5 años (60 meses)
              del plan Rent to Own. Es una inversión que se suma a tu propiedad.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-sm mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-blue-100">Reembolsable</span>
              </div>
              <p className="text-2xl font-bold">100%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-blue-100">Se aplica en</span>
              </div>
              <p className="text-2xl font-bold">Mes 60</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {!showWompiWidget && !depositPaid && paymentType === 'deposit' && (
        <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Realiza tu Depósito Inicial
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethod(method.id)}
                  className={`p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
                    selectedMethod === method.id
                      ? theme === 'dark'
                        ? 'border-blue-600 bg-blue-600/10'
                        : 'border-blue-700 bg-blue-50'
                      : theme === 'dark'
                        ? 'border-blue-600/30 hover:border-blue-600/50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        method.color === 'blue'
                          ? 'bg-blue-100'
                          : method.color === 'green'
                          ? 'bg-green-100'
                          : method.color === 'blue'
                          ? 'bg-blue-100'
                          : 'bg-orange-100'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          method.color === 'blue'
                            ? 'text-blue-600'
                            : method.color === 'green'
                            ? 'text-green-600'
                            : method.color === 'blue'
                            ? 'text-blue-700'
                            : 'text-orange-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {method.name}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{method.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!showWompiWidget && depositPaid && paymentType === 'deposit' && (
        <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ¡Depósito Pagado!
            </h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Tu depósito de {formatCurrency(depositAmount)} fue recibido exitosamente
              el {depositDate}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">
                📌 Recuerda
              </h4>
              <p className="text-sm text-blue-800">
                Este monto se aplicará automáticamente al finalizar tu plan de 60 meses,
                reduciendo el costo final de tu vehículo. ¡Es parte de tu inversión!
              </p>
            </div>
          </div>
        </div>
      )}

      {!showWompiWidget && paymentType === 'weekly' && (
        <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Selecciona tu Método de Pago
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethod(method.id)}
                  className={`p-6 border-2 rounded-xl transition-all hover:shadow-lg ${
                    selectedMethod === method.id
                      ? theme === 'dark'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-blue-600 bg-blue-50'
                      : theme === 'dark'
                        ? 'border-blue-600/30 hover:border-blue-600/50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        method.color === 'blue'
                          ? 'bg-blue-100'
                          : method.color === 'green'
                          ? 'bg-green-100'
                          : method.color === 'blue'
                          ? 'bg-blue-100'
                          : 'bg-orange-100'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          method.color === 'blue'
                            ? 'text-blue-600'
                            : method.color === 'green'
                            ? 'text-green-600'
                            : method.color === 'blue'
                            ? 'text-blue-700'
                            : 'text-orange-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {method.name}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{method.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Wompi Payment Widget */}
      {showWompiWidget && (
        <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Portal de Pago Wompi</h3>
            <button
              onClick={() => {
                setShowWompiWidget(false);
                setSelectedMethod('');
              }}
              className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Cambiar método
            </button>
          </div>

          {/* Wompi Widget Simulation */}
          <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
            {/* Wompi Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1A1FE8] to-[#3D42F0] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Wompi</h4>
                  <p className="text-xs text-gray-500">Pago seguro</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                  alt="Visa"
                  className="h-6"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  alt="Mastercard"
                  className="h-6"
                />
              </div>
            </div>

            {/* Payment Amount */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Monto a pagar</p>
              <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(getCurrentPaymentAmount())}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {paymentType === 'weekly' ? 'Cuota semanal' : 'Depósito inicial'} - DriveOwn
              </p>
            </div>

            {/* Payment Form */}
            {selectedMethod === 'credit' || selectedMethod === 'debit' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Titular
                  </label>
                  <input
                    type="text"
                    placeholder="JUAN PEREZ"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuotas
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none">
                    <option>1 cuota - Sin interés</option>
                    <option>3 cuotas - 2.5% mensual</option>
                    <option>6 cuotas - 2.5% mensual</option>
                    <option>12 cuotas - 2.5% mensual</option>
                  </select>
                </div>
              </div>
            ) : selectedMethod === 'pse' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona tu Banco
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none">
                    <option value="">Selecciona un banco</option>
                    <option>Bancolombia</option>
                    <option>Banco de Bogotá</option>
                    <option>BBVA Colombia</option>
                    <option>Davivienda</option>
                    <option>Banco Popular</option>
                    <option>Colpatria</option>
                    <option>Banco de Occidente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Persona
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none">
                    <option>Persona Natural</option>
                    <option>Persona Jurídica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none">
                    <option>Cédula de Ciudadanía</option>
                    <option>Cédula de Extranjería</option>
                    <option>NIT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Documento
                  </label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona tu Cartera Digital
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none">
                    <option value="">Selecciona una opción</option>
                    <option>Nequi</option>
                    <option>Daviplata</option>
                    <option>PayPal</option>
                    <option>Movii</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Celular
                  </label>
                  <input
                    type="tel"
                    placeholder="300 123 4567"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            )}

            {/* Security Info */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-1">Pago 100% seguro</p>
                  <p>
                    Tu información está protegida con encriptación de nivel bancario.
                    Wompi cumple con los estándares PCI DSS.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button className="w-full mt-6 py-4 bg-gradient-to-r from-[#1A1FE8] to-[#3D42F0] text-white rounded-lg font-bold text-lg hover:from-[#1217C8] hover:to-[#1A1FE8] transition-all shadow-lg">
              Pagar {formatCurrency(getCurrentPaymentAmount())}
            </button>

            {/* Powered by Wompi */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Powered by <span className="font-semibold">Wompi</span>
            </p>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
        <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Historial de Pagos</h3>

        <div className="space-y-3">
          {paymentHistory.map((payment, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{payment.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{payment.date}</p>
                <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                  Completado
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              💳 Información sobre Pagos Semanales
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Cuota semanal fija:</strong> {formatCurrency(weeklyPayment)} cada semana</li>
              <li>• <strong>Fecha de pago:</strong> Cada domingo</li>
              <li>• Puedes pagar con cualquier método disponible</li>
              <li>• Recibirás un recibo por email después de cada pago semanal</li>
              <li>• Los pagos atrasados pueden generar intereses de mora</li>
              <li>• Configura débito automático para no olvidar tus pagos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
