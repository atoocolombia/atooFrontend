import {
  Battery,
  Star,
  MapPin,
  Navigation,
  Zap,
  TrendingUp,
  Shield,
  FileCheck,
  Loader2,
  Satellite,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getSessionUser } from '../../../lib/authRouting';
import {
  fetchLatestClientGpsReport,
  formatGpsPeriod,
  type ClientGpsReportView,
} from '../../../lib/clientGpsApi';
import { fetchVehicleInspectionPlan, type VehicleInspectionPlan } from '../../../lib/inspectionsApi';

export function VehicleView() {
  const { theme } = useTheme();

  // Datos simulados del vehículo
  const vehicleData = {
    model: 'Nammi EV',
    vin: 'LNBM2EV3XN1234567',
    battery: 68, // Porcentaje de batería
    range: 245, // Kilómetros de autonomía
    careScore: 4.5, // Score de cuidado (0-5)
    totalCharges: 156,
    optimalCharges: 142, // Cargas entre 20%-80%
    soatExpiry: '2026-12-15', // Vencimiento SOAT
    insuranceExpiry: '2026-11-20', // Vencimiento Todoriesgo
  };

  const [showMap, setShowMap] = useState(true);
  const [plan, setPlan] = useState<VehicleInspectionPlan | null>(null);
  const [gpsReport, setGpsReport] = useState<ClientGpsReportView | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);

  useEffect(() => {
    const user = getSessionUser({ refresh: false });
    if (!user?.id) {
      setGpsLoading(false);
      return;
    }
    void (async () => {
      try {
        const [planRow, report] = await Promise.all([
          fetchVehicleInspectionPlan(user.id).catch(() => null),
          fetchLatestClientGpsReport().catch(() => null),
        ]);
        setPlan(planRow);
        setGpsReport(report);
      } finally {
        setGpsLoading(false);
      }
    })();
  }, []);

  const displayModel = plan?.vehicleName ?? vehicleData.model;
  const displayVin = plan?.vin ?? vehicleData.vin;

  // Calcular el porcentaje de cargas óptimas
  const optimalPercentage = Math.round(
    (vehicleData.optimalCharges / vehicleData.totalCharges) * 100
  );

  // Calcular días restantes para vencimientos
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date('2026-04-17'); // Fecha actual del sistema
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const soatDaysRemaining = getDaysUntilExpiry(vehicleData.soatExpiry);
  const insuranceDaysRemaining = getDaysUntilExpiry(vehicleData.insuranceExpiry);

  const getExpiryStatus = (daysRemaining: number) => {
    if (daysRemaining < 0) return { color: 'red', label: 'Vencido', bgColor: 'bg-red-100', textColor: 'text-red-600', borderColor: 'border-red-200' };
    if (daysRemaining <= 30) return { color: 'orange', label: 'Por vencer', bgColor: 'bg-orange-100', textColor: 'text-orange-600', borderColor: 'border-orange-200' };
    return { color: 'green', label: 'Vigente', bgColor: 'bg-green-100', textColor: 'text-green-600', borderColor: 'border-green-200' };
  };

  // Puntos de carga cercanos (simulados)
  const chargingStations = [
    { name: 'Electro Charge Plaza Centro', distance: 1.2, available: 3, total: 4 },
    { name: 'PowerUp Station Reforma', distance: 2.8, available: 2, total: 3 },
    { name: 'Fast Charge Polanco', distance: 3.5, available: 5, total: 6 },
    { name: 'Green Energy Roma Norte', distance: 4.1, available: 1, total: 2 },
  ];

  // Función para renderizar estrellas
  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-6 h-6 ${
            i <= Math.floor(score)
              ? 'fill-yellow-400 text-yellow-400'
              : i - 0.5 <= score
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Mi Vehículo</h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Información y estado actual de tu {displayModel}
        </p>
      </div>

      {/* GPS report from analyst upload */}
      <div
        className={`rounded-2xl shadow-lg p-6 border transition-colors ${
          theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#1A1FE8]/10 rounded-lg flex items-center justify-center">
            <Satellite className="w-5 h-5 text-[#1A1FE8]" />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {gpsReport?.summaryTitle ?? 'Telemetría del vehículo'}
            </h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              {gpsReport?.hasGpsLocation
                ? 'Última ubicación reportada por el proveedor'
                : 'Datos del último informe del proveedor (sin GPS en vivo en la app)'}
            </p>
          </div>
        </div>
        {gpsLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-7 h-7 animate-spin text-[#1A1FE8]" />
          </div>
        ) : !gpsReport ? (
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Aún no hay un informe GPS publicado para tu vehículo. Cuando atoo reciba el archivo del
            proveedor, verás aquí ubicación y recorrido del periodo.
          </p>
        ) : (
          <div className="space-y-4">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {formatGpsPeriod(gpsReport.periodFrom, gpsReport.periodTo)}
              {gpsReport.lastReportAt && (
                <span className="block text-xs mt-1">
                  Última lectura:{' '}
                  {new Date(gpsReport.lastReportAt).toLocaleString('es-CO', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              )}
            </p>
            {gpsReport.hasGpsLocation && gpsReport.lastLocation && (
              <div className="flex gap-2 items-start">
                <MapPin className="w-5 h-5 text-[#1A1FE8] shrink-0 mt-0.5" />
                <div>
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {gpsReport.lastLocation}
                  </p>
                  {gpsReport.lastLatitude != null && gpsReport.lastLongitude != null && (
                    <a
                      href={`https://www.google.com/maps?q=${gpsReport.lastLatitude},${gpsReport.lastLongitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#1A1FE8] font-medium hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Ver en mapa
                    </a>
                  )}
                </div>
              </div>
            )}
            {(() => {
              const u = gpsReport.usageSummary;
              const routeKm = u?.routeKm ?? gpsReport.totalDistanceKm;
              const maxSp = u?.maxSpeedKmh ?? gpsReport.maxSpeedKmh;
              const avgSp = u?.avgSpeedKmh ?? gpsReport.avgSpeedKmh;
              const hasMainStats = routeKm != null || maxSp != null || avgSp != null;
              return (
                <>
                  {hasMainStats && (
                    <div className="grid sm:grid-cols-3 gap-3">
                      {routeKm != null && (
                        <div className={`rounded-xl p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-500">Km recorridos (periodo)</p>
                          <p className="text-lg font-bold tabular-nums">{routeKm} km</p>
                        </div>
                      )}
                      {maxSp != null && (
                        <div className={`rounded-xl p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-500">Vel. máxima</p>
                          <p className="text-lg font-bold tabular-nums">{Math.round(maxSp)} km/h</p>
                        </div>
                      )}
                      {avgSp != null && (
                        <div className={`rounded-xl p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-500">Vel. media</p>
                          <p className="text-lg font-bold tabular-nums">{Math.round(avgSp)} km/h</p>
                        </div>
                      )}
                    </div>
                  )}
                  {(u?.movementDuration || u?.parkedDuration || u?.vehicleOdometerKm != null) && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {u?.movementDuration && (
                        <div className={`rounded-xl p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-500">Tiempo en movimiento</p>
                          <p className="text-sm font-semibold tabular-nums">{u.movementDuration}</p>
                        </div>
                      )}
                      {u?.parkedDuration && (
                        <div className={`rounded-xl p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <p className="text-xs text-gray-500">Tiempo estacionado</p>
                          <p className="text-sm font-semibold tabular-nums">{u.parkedDuration}</p>
                        </div>
                      )}
                      {u?.vehicleOdometerKm != null && (
                        <div
                          className={`rounded-xl p-3 sm:col-span-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}
                        >
                          <p className="text-xs text-gray-500">Kilometraje del vehículo (odómetro)</p>
                          <p className="text-lg font-bold tabular-nums">{u.vehicleOdometerKm} km</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Total acumulado al cierre del periodo (odómetro fin del informe), no lo recorrido solo en
                            esas fechas.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {u?.engineHours && (
                    <div className={`rounded-xl p-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-500">Horas del motor</p>
                      <p className="text-sm font-semibold tabular-nums">{u.engineHours}</p>
                    </div>
                  )}
                  {gpsReport.clientHighlights?.length > 0 && (
                    <ul className="text-sm space-y-1 pt-1">
                      {gpsReport.clientHighlights.map((h) => (
                        <li key={`${h.label}-${h.value}`} className="flex justify-between gap-4">
                          <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{h.label}</span>
                          <span className="font-medium tabular-nums text-right">{h.value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              );
            })()}
            {gpsReport.plate && (
              <p className="text-xs text-gray-500">Placa en informe: {gpsReport.plate}</p>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Card */}
      <div className={`rounded-3xl shadow-2xl p-8 text-white overflow-hidden relative transition-colors ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#1A1FE8]/30 to-[#1217C8]/20 border border-blue-600/20'
          : 'bg-gradient-to-br from-slate-800 to-slate-900'
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{displayModel}</h2>
              <p className="text-gray-400 font-mono text-sm">VIN: {displayVin}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <span className="text-sm font-semibold">Rent to Own</span>
            </div>
          </div>

          {/* Car Image */}
          <div className="my-8 flex justify-center">
            <div className="relative">
              {/* Simplified car illustration */}
              <svg
                width="400"
                height="180"
                viewBox="0 0 400 180"
                className="drop-shadow-2xl"
              >
                {/* Car body */}
                <rect x="50" y="80" width="300" height="60" rx="10" fill="#3B82F6" />
                <rect x="80" y="50" width="240" height="50" rx="8" fill="#60A5FA" />

                {/* Windows */}
                <rect x="90" y="60" width="70" height="35" rx="4" fill="#1E293B" opacity="0.3" />
                <rect x="170" y="60" width="70" height="35" rx="4" fill="#1E293B" opacity="0.3" />
                <rect x="250" y="60" width="60" height="35" rx="4" fill="#1E293B" opacity="0.3" />

                {/* Wheels */}
                <circle cx="120" cy="140" r="25" fill="#1E293B" />
                <circle cx="120" cy="140" r="15" fill="#4B5563" />
                <circle cx="280" cy="140" r="25" fill="#1E293B" />
                <circle cx="280" cy="140" r="15" fill="#4B5563" />

                {/* Headlight */}
                <circle cx="340" cy="100" r="8" fill="#FCD34D" opacity="0.8" />

                {/* Details */}
                <rect x="60" y="95" width="15" height="30" rx="3" fill="#1E40AF" />
                <rect x="325" y="95" width="15" height="30" rx="3" fill="#DC2626" />

                {/* Lightning bolt (electric) */}
                <path
                  d="M200 90 L195 100 L200 100 L195 110 L205 100 L200 100 Z"
                  fill="#FCD34D"
                />
              </svg>

              {/* Badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                🔋 Vehículo Eléctrico
              </div>
            </div>
          </div>

          {/* Battery Status */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold">Nivel de Batería</span>
              <span className="text-3xl font-bold">{vehicleData.battery}%</span>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  vehicleData.battery > 50
                    ? 'bg-green-500'
                    : vehicleData.battery > 20
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${vehicleData.battery}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* SOAT */}
        <div className={`rounded-2xl shadow-lg p-6 border-2 transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 backdrop-blur-xl' : 'bg-white'} ${getExpiryStatus(soatDaysRemaining).borderColor}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getExpiryStatus(soatDaysRemaining).bgColor}`}>
                <FileCheck className={`w-6 h-6 ${getExpiryStatus(soatDaysRemaining).textColor}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">SOAT</h3>
                <p className="text-xs text-gray-500">Seguro Obligatorio</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getExpiryStatus(soatDaysRemaining).bgColor} ${getExpiryStatus(soatDaysRemaining).textColor}`}>
              {getExpiryStatus(soatDaysRemaining).label}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Vencimiento</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicleData.soatExpiry}</p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Días restantes</p>
              <p className={`text-2xl font-bold ${getExpiryStatus(soatDaysRemaining).textColor}`}>
                {soatDaysRemaining > 0 ? soatDaysRemaining : 0} días
              </p>
            </div>
          </div>

          {soatDaysRemaining <= 30 && soatDaysRemaining > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-orange-600 font-semibold">
                ⚠️ Renueva pronto para evitar multas
              </p>
            </div>
          )}
        </div>

        {/* Todoriesgo */}
        <div className={`rounded-2xl shadow-lg p-6 border-2 transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 backdrop-blur-xl' : 'bg-white'} ${getExpiryStatus(insuranceDaysRemaining).borderColor}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getExpiryStatus(insuranceDaysRemaining).bgColor}`}>
                <Shield className={`w-6 h-6 ${getExpiryStatus(insuranceDaysRemaining).textColor}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Todoriesgo</h3>
                <p className="text-xs text-gray-500">Seguro Todo Riesgo</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getExpiryStatus(insuranceDaysRemaining).bgColor} ${getExpiryStatus(insuranceDaysRemaining).textColor}`}>
              {getExpiryStatus(insuranceDaysRemaining).label}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Vencimiento</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{vehicleData.insuranceExpiry}</p>
            </div>
            <div>
              <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Días restantes</p>
              <p className={`text-2xl font-bold ${getExpiryStatus(insuranceDaysRemaining).textColor}`}>
                {insuranceDaysRemaining > 0 ? insuranceDaysRemaining : 0} días
              </p>
            </div>
          </div>

          {insuranceDaysRemaining <= 30 && insuranceDaysRemaining > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-orange-600 font-semibold">
                ⚠️ Contacta a tu aseguradora para renovar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Autonomy */}
        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Autonomía Restante</h3>
          </div>
          <div className="mb-2">
            <span className="text-4xl font-bold text-gray-900">{vehicleData.range}</span>
            <span className="text-xl text-gray-500 ml-2">km</span>
          </div>
          <p className="text-sm text-gray-600">
            Estimado antes de la próxima carga 🛣️
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Con batería al {vehicleData.battery}%
            </p>
          </div>
        </div>

        {/* Care Score */}
        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Score de Cuidado</h3>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {renderStars(vehicleData.careScore)}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {vehicleData.careScore >= 4
              ? '¡Excelente! Mantienes la batería saludable ⭐'
              : vehicleData.careScore >= 3
              ? 'Buen trabajo, sigue así ⭐'
              : 'Intenta cargar entre 20%-80% ⭐'}
          </p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-green-600">{optimalPercentage}%</span> de
              tus cargas están en rango óptimo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {vehicleData.optimalCharges} de {vehicleData.totalCharges} cargas totales
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`rounded-2xl shadow-lg p-6 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Estadísticas</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cargas totales</span>
              <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {vehicleData.totalCharges}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cargas óptimas</span>
              <span className="text-lg font-bold text-green-600">
                {vehicleData.optimalCharges}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">Eficiencia</span>
              <span className="text-lg font-bold text-blue-600">{optimalPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charging Stations */}
      <div className={`rounded-2xl shadow-lg p-8 border transition-colors ${theme === 'dark' ? 'bg-[#0D0F2E]/50 border-blue-600/20 backdrop-blur-xl' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Estaciones de Carga Cercanas 📍
            </h3>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            {showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
          </button>
        </div>

        {/* Map Placeholder */}
        {showMap && (
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl h-64 flex items-center justify-center border-2 border-dashed border-blue-200 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="1"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div className="relative z-10 text-center">
              <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700 font-semibold mb-1">Mapa Interactivo</p>
              <p className="text-sm text-gray-500">
                Mostrando estaciones cercanas a tu ubicación
              </p>
              {/* Simulated pins */}
              <div className="flex gap-3 justify-center mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-red-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stations List */}
        <div className="space-y-3">
          {chargingStations.map((station, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{station.name}</h4>
                  <p className="text-sm text-gray-500">{station.distance} km de distancia</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {station.available}/{station.total} disponibles
                </p>
                <p className="text-xs text-gray-500">Cargadores rápidos</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Consejo de Carga</h4>
          <p className="text-sm text-blue-800">
            Para mantener tu Score de Cuidado alto, intenta cargar tu vehículo cuando
            la batería esté entre 20% y 80%. Esto maximiza la vida útil de la batería.
          </p>
        </div>
      </div>
    </div>
  );
}
