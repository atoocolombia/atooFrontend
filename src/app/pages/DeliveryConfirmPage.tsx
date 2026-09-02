import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { confirmDeliveryByToken, fetchDeliveryConfirmPreview } from '../../lib/deliveriesApi';

export function DeliveryConfirmPage() {
  const { token = '' } = useParams();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState<{ clientName: string; vin: string | null; alreadyConfirmed: boolean } | null>(
    null,
  );

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchDeliveryConfirmPreview(token);
        setPreview(data);
        if (data.alreadyConfirmed) setDone(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Enlace inválido');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);
    try {
      await confirmDeliveryByToken(token);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {loading ? (
          <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" /></div>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : done ? (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">¡Gracias, {preview?.clientName}!</h1>
            <p className="text-gray-600">Confirmamos el recibido exitoso de tu vehículo atoo.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Confirmar entrega</h1>
            <p className="text-gray-600 mb-4">
              Hola {preview?.clientName}, confirma que recibiste tu vehículo
              {preview?.vin ? ` (VIN ${preview.vin})` : ''}.
            </p>
            <button
              type="button"
              disabled={confirming}
              onClick={() => void handleConfirm()}
              className="w-full py-3 rounded-xl bg-[#1A1FE8] text-white font-semibold disabled:opacity-50"
            >
              {confirming ? 'Confirmando…' : 'Confirmo recibido exitoso'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
