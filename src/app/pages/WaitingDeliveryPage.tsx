import { useEffect, useState } from 'react';
import { Car, Clock, Loader2, LogOut } from 'lucide-react';
import { clearUserSession, getSessionUser } from '../../lib/authRouting';
import { fetchClientAccess, type ClientAccessState } from '../../lib/clientAccessApi';

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Solicitud enviada',
  APPROVED: 'Solicitud aprobada',
  REJECTED: 'Solicitud no aprobada',
  PENDING_DOCUMENTS: 'Preparando documentos de entrega',
  DOCUMENTS_SENT: 'Documentos enviados para firma',
  DOCUMENTS_SIGNED: 'Documentos firmados',
  IN_DELIVERY: 'Entrega en curso',
  AWAITING_CLIENT_CONFIRMATION: 'Esperando confirmación de recibido',
};

export function WaitingDeliveryPage() {
  const user = getSessionUser();
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState<ClientAccessState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void fetchClientAccess(user.id)
      .then(setAccess)
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar el estado'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleLogout = async () => {
    await clearUserSession();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-[#1A1FE8] text-xl">atoo</span>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
            </div>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <Car className="w-8 h-8 text-[#1A1FE8]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {access?.deliveryStatus === 'AWAITING_CLIENT_CONFIRMATION'
                  ? 'Confirma la entrega de tu vehículo'
                  : 'Aún no se ha entregado tu vehículo'}
              </h1>
              <p className="text-gray-600 mb-6">{access?.message}</p>

              {(access?.applicationStatus || access?.deliveryStatus) && (
                <div className="rounded-xl bg-gray-50 p-4 text-left space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-[#1A1FE8]" />
                    <span className="font-medium">Estado del proceso</span>
                  </div>
                  {access.applicationStatus && (
                    <p className="text-sm text-gray-600">
                      Solicitud: {STATUS_LABELS[access.applicationStatus] ?? access.applicationStatus}
                    </p>
                  )}
                  {access.deliveryStatus && (
                    <p className="text-sm text-gray-600">
                      Entrega: {STATUS_LABELS[access.deliveryStatus] ?? access.deliveryStatus}
                    </p>
                  )}
                </div>
              )}

            </>
          )}
        </div>
      </main>
    </div>
  );
}
