import { AlertCircle, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Receipt } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  categoryLabel,
  deferLineHint,
  formatCop,
  type BillingPeriodListItem,
  type ClientBillingStatement,
} from '../../../lib/clientBillingApi';
import { formatNextPaymentDate } from '../../../lib/clientPaymentsApi';

type MonthlyBillingStatementProps = {
  statement: ClientBillingStatement | null;
  periods: BillingPeriodListItem[];
  loading: boolean;
  error: string | null;
  year: number;
  month: number;
  onPeriodChange: (year: number, month: number) => void;
  onReload: () => void;
};

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function MonthlyBillingStatement({
  statement,
  periods,
  loading,
  error,
  year,
  month,
  onPeriodChange,
  onReload,
}: MonthlyBillingStatementProps) {
  const { theme } = useTheme();

  const cardClass =
    theme === 'dark'
      ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl'
      : 'bg-white border-gray-100';

  const canGoPrev = periods.some(
    (p) => p.year < year || (p.year === year && p.month < month),
  );
  const canGoNext = periods.some(
    (p) => p.year > year || (p.year === year && p.month > month),
  );

  const goPrev = () => {
    const target = shiftMonth(year, month, -1);
    const exists = periods.some((p) => p.year === target.year && p.month === target.month);
    if (exists) onPeriodChange(target.year, target.month);
  };

  const goNext = () => {
    const target = shiftMonth(year, month, 1);
    const exists = periods.some((p) => p.year === target.year && p.month === target.month);
    if (exists) onPeriodChange(target.year, target.month);
  };

  if (loading && !statement) {
    return (
      <div className={`rounded-2xl border p-8 flex justify-center ${cardClass}`}>
        <Loader2 className="w-8 h-8 animate-spin text-[#1A1FE8]" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-lg p-8 border ${cardClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#1A1FE8]/10 flex items-center justify-center">
            <Receipt className="w-6 h-6 text-[#1A1FE8]" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Cuenta de cobro
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Consulta mes a mes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={goPrev}
            className="p-2 rounded-lg border border-inherit disabled:opacity-30"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <select
            value={`${year}-${month}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-').map(Number);
              if (y && m) onPeriodChange(y, m);
            }}
            className={`rounded-xl border px-3 py-2 text-sm font-medium min-w-[10rem] ${
              theme === 'dark' ? 'bg-white/5 border-blue-600/30' : 'border-gray-200'
            }`}
          >
            {periods.map((p) => (
              <option key={`${p.year}-${p.month}`} value={`${p.year}-${p.month}`}>
                {p.label}
                {p.isCurrent ? ' (actual)' : ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={goNext}
            className="p-2 rounded-lg border border-inherit disabled:opacity-30"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && !statement && (
        <p className="text-sm text-red-500">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void onReload()}>
            Reintentar
          </button>
        </p>
      )}

      {statement && (
        <>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {statement.periodLabel}
            {!statement.isCurrentPeriod && (
              <span className="ml-2 text-xs opacity-80">(historial)</span>
            )}
          </p>

          {statement.collection.alertTitle && statement.collection.alertMessage && (
            <CollectionAlert collection={statement.collection} theme={theme} />
          )}

          <div className="space-y-3">
            <div className="flex justify-between gap-4 py-2 border-b border-inherit">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                {statement.baseInstallmentLabel}
              </span>
              <span className={`font-semibold tabular-nums ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {formatCop(statement.baseInstallmentCop)}
              </span>
            </div>

            {(statement.workshopCharges?.length ?? 0) > 0 && (
              <>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide pt-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Taller (procedimientos autorizados)
                </p>
                {statement.workshopCharges.map((line) => (
                  <div key={line.id} className="flex justify-between gap-4 py-2 border-b border-inherit/50">
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {line.title}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {line.workshopName}
                        {line.paymentMode === 'deferred'
                          ? ` · Diferido ${line.deferMonths} meses · Total ${formatCop(line.totalCostCop)}`
                          : ` · Pago único · Total ${formatCop(line.totalCostCop)}`}
                      </p>
                      {line.installmentLabel && (
                        <p className="text-xs text-[#1A1FE8] mt-0.5">{line.installmentLabel}</p>
                      )}
                    </div>
                    <span
                      className={`font-semibold tabular-nums shrink-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      {formatCop(line.amountCop)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-2 text-sm">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Subtotal taller
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCop(statement.workshopSubtotalCop ?? 0)}
                  </span>
                </div>
              </>
            )}

            {statement.extras.length === 0 && (statement.workshopCharges?.length ?? 0) === 0 ? (
              <p className={`text-sm py-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Sin cargos adicionales en este mes.
              </p>
            ) : statement.extras.length > 0 ? (
              statement.extras.map((line) => {
                const deferHint = deferLineHint(line);
                return (
                  <div key={line.id} className="flex justify-between gap-4 py-2 border-b border-inherit/50">
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {line.label}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {categoryLabel(line.category)}
                        {line.description ? ` · ${line.description}` : ''}
                      </p>
                      {deferHint && (
                        <p className="text-xs text-[#1A1FE8] mt-0.5">{deferHint}</p>
                      )}
                    </div>
                    <span
                      className={`font-semibold tabular-nums shrink-0 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      {formatCop(line.amountCop)}
                    </span>
                  </div>
                );
              })
            ) : null}

            {statement.extras.length > 0 && (
              <div className="flex justify-between gap-4 py-2 text-sm">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Subtotal servicios extras
                </span>
                <span className="font-medium tabular-nums">{formatCop(statement.extrasSubtotalCop)}</span>
              </div>
            )}

            <div className="flex justify-between gap-4 pt-4 mt-2 border-t-2 border-[#1A1FE8]/30">
              <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Total a pagar del mes
              </span>
              <span className="text-2xl font-bold text-[#1A1FE8] tabular-nums">
                {formatCop(statement.totalDueCop)}
              </span>
            </div>

            <div className="flex justify-between gap-4 py-2 text-sm border-b border-inherit/50">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Pagos registrados por atoo (este mes)
              </span>
              <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {formatCop(statement.collection.paidRegisteredCop)}
              </span>
            </div>

            {statement.collection.remainingDueCop > 0 && (
              <div className="flex justify-between gap-4 py-2 text-sm">
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Saldo pendiente</span>
                <span className="font-semibold tabular-nums text-amber-700 dark:text-amber-300">
                  {formatCop(statement.collection.remainingDueCop)}
                </span>
              </div>
            )}

            {(statement.collection.dueAt || statement.nextPaymentDueAt) && (
              <p className={`text-sm pt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Fecha de referencia:{' '}
                {formatNextPaymentDate(statement.collection.dueAt ?? statement.nextPaymentDueAt)}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CollectionAlert({
  collection,
  theme,
}: {
  collection: import('../../../lib/clientBillingApi').BillingCollection;
  theme: string;
}) {
  const styles: Record<
    import('../../../lib/clientBillingApi').BillingCollectionStatus,
    { box: string; Icon: typeof AlertCircle }
  > = {
    paid: {
      box: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-100',
      Icon: CheckCircle2,
    },
    partial: {
      box: 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-100',
      Icon: AlertTriangle,
    },
    pending: {
      box: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-100',
      Icon: AlertCircle,
    },
    due_soon: {
      box: 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-500/15 dark:border-amber-400/40 dark:text-amber-50',
      Icon: AlertTriangle,
    },
    overdue: {
      box: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-500/10 dark:border-red-500/40 dark:text-red-100',
      Icon: AlertCircle,
    },
  };

  const { box, Icon } = styles[collection.status];

  return (
    <div className={`rounded-xl border p-4 mb-5 ${box}`}>
      <div className="flex gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">{collection.alertTitle}</p>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'opacity-90' : 'opacity-95'}`}>
            {collection.alertMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
