import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  daysUntilDue,
  formatCop,
  formatNextPaymentDate,
  formatPaymentDate,
  useClientPaymentSummary,
} from '../../../lib/clientPaymentsApi';
import { useClientBilling, useCurrentBillingPeriod } from '../../../lib/clientBillingApi';
import { MonthlyBillingStatement } from './MonthlyBillingStatement';
import { ServiceOfferBanner } from './ServiceOfferBanner';
import { createWompiWidgetSession, type WompiWidgetSession } from '../../../lib/wompiApi';
import { WompiWidgetCheckout } from './WompiWidgetCheckout';

export function PaymentsView() {
  const { theme } = useTheme();
  const { summary, loading, error, reload } = useClientPaymentSummary();
  const { year: billYear, month: billMonth, setYear: setBillYear, setMonth: setBillMonth } =
    useCurrentBillingPeriod();
  const billing = useClientBilling(billYear, billMonth, !loading);

  const billingBlock = (
    <MonthlyBillingStatement
      statement={billing.statement}
      periods={billing.periods}
      loading={billing.loading}
      error={billing.error}
      year={billYear}
      month={billMonth}
      onPeriodChange={(y, m) => {
        setBillYear(y);
        setBillMonth(m);
      }}
      onReload={() => void billing.reload()}
    />
  );

  const offerBanner =
    billing.statement?.isCurrentPeriod && billing.statement.pendingOffer ? (
      <ServiceOfferBanner
        offer={billing.statement.pendingOffer}
        onStatementChange={(next) => {
          billing.setStatement(next);
          void billing.reload();
        }}
      />
    ) : null;

  const [paymentType, setPaymentType] = useState<'weekly' | 'deposit'>('weekly');
  const [wompiSession, setWompiSession] = useState<WompiWidgetSession | null>(null);
  const [wompiError, setWompiError] = useState<string | null>(null);
  const [wompiLoading, setWompiLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const wompiEnabled = summary?.wompiEnabled ?? false;
  const weeklyPayment = summary?.weeklyPaymentCop ?? 207_000;
  const depositAmount = summary?.depositAmountCop;
  const nextPaymentDate = formatNextPaymentDate(summary?.nextPaymentDueAt ?? null);
  const depositPaid = summary?.depositPaid ?? false;
  const depositDate = summary?.depositPaidAt
    ? formatNextPaymentDate(summary.depositPaidAt)
    : '—';
  const paymentHistory = summary?.history ?? [];
  const daysLeft = daysUntilDue(summary?.nextPaymentDueAt ?? null);

  const depositPayable =
    !depositPaid && summary?.depositAmountCop != null && summary.depositAmountCop > 0;
  const canPayOnlineWompi =
    wompiEnabled &&
    ((paymentType === 'weekly' && (summary?.remainingInstallments ?? 1) > 0) ||
      (paymentType === 'deposit' && depositPayable));

  useEffect(() => {
    if (searchParams.get('wompi') === 'return') {
      void reload();
    }
  }, [searchParams, reload]);

  useEffect(() => {
    if (!canPayOnlineWompi) {
      setWompiSession(null);
      setWompiError(null);
      return;
    }
    setWompiLoading(true);
    setWompiError(null);
    const kind = paymentType === 'deposit' ? 'deposit' : 'installment';
    void createWompiWidgetSession(kind)
      .then((session) => {
        setWompiSession(session);
      })
      .catch((err) => {
        setWompiError(err instanceof Error ? err.message : 'No se pudo preparar Wompi');
        setWompiSession(null);
      })
      .finally(() => setWompiLoading(false));
  }, [canPayOnlineWompi, paymentType]);

  const formatCurrency = (amount: number) => formatCop(amount);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-10 h-10 animate-spin text-[#1A1FE8]" />
      </div>
    );
  }

  if (summary?.installmentPlan) {
    const cuota = summary.weeklyPaymentCop;
    const paid = summary.installmentsPaid;
    const total = summary.planInstallments;
    const pct = summary.progressPercent;
    const history = summary.history;

    return (
      <div className="space-y-6">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pagos</h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Tu plan y el avance según los pagos que atoo ya registró
          </p>
          {error && (
            <p className="text-sm text-red-500 mt-2">
              {error}{' '}
              <button type="button" className="underline" onClick={() => void reload()}>
                Reintentar
              </button>
            </p>
          )}
        </div>

        {offerBanner}

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Plan de cuotas</h2>
              <p className="text-blue-100 mt-1">
                {formatCurrency(cuota)} · {total} cuotas · Total {formatCurrency(cuota * total)}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="text-sm font-semibold">
                {paid} / {total} pagadas
              </span>
            </div>
          </div>

          <div className="h-4 rounded-full bg-white/20 overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-3xl font-bold mb-1">{pct}% del plan</p>
          <p className="text-blue-100 text-sm">
            {paid === 0
              ? 'Cuando registremos tu primer pago, verás aquí el detalle.'
              : `Llevas ${formatCurrency(summary.totalPaidCop)} abonados en ${paid} cuota${paid === 1 ? '' : 's'}.`}
          </p>
          {summary.nextPaymentDueAt && paid < total && (
            <p className="text-blue-100 text-sm mt-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Referencia próxima cuota: {nextPaymentDate}
              {daysLeft !== null && daysLeft >= 0 && ` (${daysLeft} días)`}
            </p>
          )}
        </div>

        {!wompiEnabled && (summary?.remainingInstallments ?? 0) > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            <p className="font-semibold mb-1">Pago en línea (Wompi) no está activo</p>
            <p>
              El servidor aún no tiene configuradas las llaves Wompi (sandbox o producción). Cuando estén listas verás
              aquí el botón para pagar {formatCurrency(cuota)}.
            </p>
          </div>
        )}

        {canPayOnlineWompi && paymentType === 'weekly' && (
          <div
            className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}
          >
            <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Pagar siguiente cuota con Wompi
            </h3>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Una transacción = una cuota de {formatCurrency(cuota)}. El monto viene del servidor y no se puede
              modificar en el checkout.
            </p>
            {wompiError && <p className="text-sm text-red-500 mb-4">{wompiError}</p>}
            {searchParams.get('wompi') === 'return' && (
              <p className="text-sm text-emerald-600 mb-4">
                Si ya completaste el pago, el historial se actualizará en unos instantes cuando Wompi confirme la
                transacción.
              </p>
            )}
            {wompiLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
              </div>
            ) : (
              <WompiWidgetCheckout session={wompiSession} />
            )}
          </div>
        )}

        <div
          className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}
        >
          <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Pagos registrados
          </h3>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className={`text-center py-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Aún no hay pagos registrados a tu nombre.
              </p>
            ) : (
              history.map((payment, index) => {
                const cuotaNumber = paid - index;
                return (
                <div
                  key={payment.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-800">
                      {cuotaNumber}
                    </div>
                    <div>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Cuota {cuotaNumber} · {formatCurrency(payment.amountCop)}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {payment.paymentMethodLabel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatPaymentDate(payment.paidAt)}
                    </p>
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                      Registrado
                    </span>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p>
                Los pagos con Wompi aparecen aquí cuando el servidor recibe la confirmación. Las transferencias las
                registra el equipo de atoo. Si acabas de pagar y no ves el movimiento, contáctanos por soporte.
              </p>
            </div>
          </div>
        </div>

        {billingBlock}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pagos</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Historial confirmado por atoo y opciones de pago en línea
        </p>
        {error && (
          <p className="text-sm text-red-500 mt-2">
            {error}{' '}
            <button type="button" className="underline" onClick={() => void reload()}>
              Reintentar
            </button>
          </p>
        )}
      </div>

      {offerBanner}

      {summary && summary.paymentsCount === 0 && (
        <div
          className={`rounded-2xl border p-6 ${theme === 'dark' ? 'bg-white/5 border-blue-600/20' : 'bg-blue-50 border-blue-200'}`}
        >
          <p className={theme === 'dark' ? 'text-gray-200' : 'text-blue-900'}>
            Cuando el equipo registre tu primer pago (transferencia, consignación, etc.), verás aquí el
            historial y tu progreso. Si ya pagaste y no aparece, escribe a soporte.
          </p>
        </div>
      )}

      {/* Payment Type Tabs */}
      <div className={`flex gap-3 rounded-2xl p-2 shadow-lg transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border border-blue-600/20 backdrop-blur-xl' : 'bg-white'}`}>
        <button
          onClick={() => setPaymentType('weekly')}
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
          onClick={() => setPaymentType('deposit')}
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
            <p className="text-2xl font-bold">
              {daysLeft === null ? '—' : daysLeft >= 0 ? `${daysLeft} días` : `${Math.abs(daysLeft)} días de atraso`}
            </p>
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
            <p className="text-5xl font-bold">
              {depositAmount != null ? formatCurrency(depositAmount) : 'Por confirmar'}
            </p>
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

      {!depositPaid && paymentType === 'deposit' && !canPayOnlineWompi && (
        <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            El pago en línea no está disponible. Si ya transferiste el depósito, el equipo atoo lo registrará en tu
            historial.
          </p>
        </div>
      )}

      {depositPaid && paymentType === 'deposit' && (
        <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ¡Depósito Pagado!
            </h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Tu depósito
              {depositAmount != null ? ` de ${formatCurrency(depositAmount)}` : ''} fue recibido exitosamente
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

      {canPayOnlineWompi && (
        <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Pagar con Wompi
          </h3>
          <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {paymentType === 'deposit'
              ? 'Depósito inicial — monto fijo definido por atoo.'
              : 'Una cuota por transacción — el monto lo fijamos según tu plan (no puedes editarlo).'}
          </p>
          {wompiError && <p className="text-sm text-red-500 mb-4">{wompiError}</p>}
          {searchParams.get('wompi') === 'return' && (
            <p className="text-sm text-emerald-600 mb-4">
              Si ya completaste el pago, el historial se actualizará en unos instantes cuando Wompi confirme la
              transacción.
            </p>
          )}
          {wompiLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
            </div>
          ) : (
            <WompiWidgetCheckout session={wompiSession} />
          )}
        </div>
      )}

      {!canPayOnlineWompi &&
        wompiEnabled &&
        paymentType === 'weekly' &&
        (summary?.remainingInstallments ?? 0) === 0 && (
          <div
            className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}
          >
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
              Ya no tienes cuotas pendientes en tu plan. Si crees que es un error, contacta a soporte.
            </p>
          </div>
        )}

      {/* Payment History */}
      <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
        <h3 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Historial de Pagos</h3>

        <div className="space-y-3">
          {paymentHistory.length === 0 ? (
            <p className={`text-center py-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Sin pagos registrados aún.
            </p>
          ) : (
            paymentHistory.map((payment) => (
              <div
                key={payment.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(payment.amountCop)}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {payment.paymentMethodLabel}
                      {payment.kind === 'deposit' ? ' · Depósito' : payment.kind === 'weekly' ? ' · Cuota' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatPaymentDate(payment.paidAt)}
                  </p>
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                    Registrado
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {billingBlock}

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
              <li>
                • <strong>Pago en línea:</strong> usa el botón de Wompi; cada clic cobra exactamente una cuota (
                {formatCurrency(weeklyPayment)}) definida por atoo
              </li>
              <li>• También puedes pagar por transferencia; el equipo lo registrará en tu historial</li>
              <li>• Los pagos atrasados pueden generar intereses de mora</li>
              <li>• Configura débito automático para no olvidar tus pagos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
