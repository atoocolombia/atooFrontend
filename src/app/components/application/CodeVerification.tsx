import { useState, useRef, useEffect } from 'react';
import { CheckCircle, Mail, Smartphone, AlertCircle } from 'lucide-react';

interface CodeVerificationProps {
  email: string;
  phone: string;
  onVerify: () => void;
}

export function CodeVerification({ email, phone, onVerify }: CodeVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const correctCode = '123456'; // Código simulado

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verificar automáticamente cuando se complete el código
    if (index === 5 && value) {
      const fullCode = newCode.join('');
      verifyCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('');
    while (newCode.length < 6) newCode.push('');
    setCode(newCode);

    if (pastedData.length === 6) {
      verifyCode(pastedData);
    }
  };

  const verifyCode = (fullCode: string) => {
    if (fullCode === correctCode) {
      onVerify();
    } else {
      setError('Código incorrecto. Por favor verifica e intenta nuevamente.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    setResendTimer(60);
    setCode(['', '', '', '', '', '']);
    setError('');
    console.log('Reenviando código...');
  };

  return (
    <div className="text-center py-8">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Solicitud Recibida!
        </h2>
        <p className="text-lg text-gray-600">
          Hemos enviado un código de verificación
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto mb-8">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center justify-center gap-2">
          <Smartphone className="w-5 h-5" />
          Revisa tu WhatsApp
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span className="font-mono">{phone}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Ingresa el código de 6 dígitos
        </label>

        <div className="flex gap-3 justify-center mb-2" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg outline-none transition-all ${
                error
                  ? 'border-red-500 bg-red-50'
                  : digit
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-600 mt-4">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-500">
            Reenviar código en{' '}
            <span className="font-semibold text-blue-600">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold underline"
          >
            Reenviar código
          </button>
        )}
      </div>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Para esta demo, usa el código{' '}
          <span className="font-mono font-bold text-blue-600">123456</span>
        </p>
      </div>
    </div>
  );
}
