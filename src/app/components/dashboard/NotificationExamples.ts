// Ejemplos de notificaciones para diferentes escenarios
// Estas están documentadas aquí para referencia y pueden activarse según el estado real del usuario

import { AlertTriangle, AlertCircle, Info, Shield, Gauge, Battery, Navigation } from 'lucide-react';

export const notificationExamples = {
  // ============ NOTIFICACIONES DE PAGO ============

  // T-24h: Recordatorio amistoso
  payment_reminder_24h: {
    id: 'pay_rem_24',
    type: 'payment',
    severity: 'info',
    title: 'Recordatorio de Pago',
    message: '¡Hola! Tu cuota mensual de $900,000 vence mañana (15 de Mayo). Realiza tu pago a tiempo para evitar inconvenientes. 😊',
    icon: Info,
  },

  // T+0h: Pago vencido
  payment_overdue: {
    id: 'pay_overdue',
    type: 'payment',
    severity: 'warning',
    title: '⚠️ Pago No Detectado',
    message: 'Tu cuota venció hoy y aún no hemos recibido tu pago. Por favor, realiza el pago lo antes posible para evitar cargos adicionales.',
    icon: AlertTriangle,
  },

  // T+6h: Advertencia de inmovilización
  payment_immobilization_warning: {
    id: 'pay_immob_warn',
    type: 'payment',
    severity: 'critical',
    title: '🛑 URGENTE: Inmovilización Preventiva en 6 Horas',
    message: 'Tu pago está vencido desde hace 6 horas. Si no recibimos el pago en las próximas 6 horas, el vehículo será inmovilizado preventivamente. Paga ahora para evitarlo.',
    icon: AlertCircle,
  },

  // T+12h: Apagado remoto
  payment_vehicle_disabled: {
    id: 'pay_disabled',
    type: 'payment',
    severity: 'critical',
    title: '🚨 VEHÍCULO INMOVILIZADO',
    message: 'Tu pago está vencido hace más de 12 horas. El vehículo ha sido apagado remotamente y se iniciará proceso de recuperación. Contacta urgentemente a soporte al +57 300 123 4567.',
    icon: AlertCircle,
  },

  // ============ NOTIFICACIONES DE SEGUROS ============

  // SOAT próximo a vencer (30 días)
  soat_expiring_30d: {
    id: 'soat_30',
    type: 'insurance',
    severity: 'warning',
    title: 'SOAT Próximo a Vencer',
    message: 'Tu SOAT vence en 30 días (15 de Dic). Renuévalo pronto para evitar multas y mantener tu vehículo legal.',
    icon: Shield,
  },

  // SOAT próximo a vencer (7 días)
  soat_expiring_7d: {
    id: 'soat_7',
    type: 'insurance',
    severity: 'critical',
    title: '🚨 SOAT Vence en 7 Días',
    message: 'Tu SOAT vence muy pronto. Renuévalo urgentemente para evitar multas de hasta $900,000 y la inmovilización del vehículo.',
    icon: Shield,
  },

  // Todoriesgo próximo a vencer
  insurance_expiring: {
    id: 'ins_exp',
    type: 'insurance',
    severity: 'warning',
    title: 'Todoriesgo Próximo a Vencer',
    message: 'Tu seguro Todoriesgo vence en 25 días (20 de Nov). Contáctanos para renovarlo y mantener tu cobertura completa.',
    icon: Shield,
  },

  // ============ NOTIFICACIONES DE USO DEL VEHÍCULO ============

  // Exceso de velocidad
  speeding_alert: {
    id: 'speed_alert',
    type: 'vehicle_use',
    severity: 'warning',
    title: '⚠️ Exceso de Velocidad Detectado',
    message: 'Detectamos que alcanzaste 130 km/h en zona de 80 km/h hoy a las 14:30. Por tu seguridad y la de otros, conduce dentro de los límites permitidos.',
    icon: Gauge,
  },

  // Velocidad extrema
  extreme_speeding: {
    id: 'extreme_speed',
    type: 'vehicle_use',
    severity: 'critical',
    title: '🚨 ALERTA: Velocidad Peligrosa',
    message: 'Se detectó velocidad de 150+ km/h. Esto pone en riesgo tu seguridad y viola los términos del contrato. Conducción temeraria puede resultar en terminación del contrato.',
    icon: Gauge,
  },

  // Batería baja crítica
  battery_critical: {
    id: 'bat_crit',
    type: 'vehicle_use',
    severity: 'critical',
    title: '🔋 Batería Crítica - 5%',
    message: 'Tu batería está al 5%. Dirígete a la estación de carga más cercana inmediatamente. La más próxima está a 2.3 km.',
    icon: Battery,
  },

  // Carga frecuente no óptima
  charging_behavior: {
    id: 'charge_behav',
    type: 'vehicle_use',
    severity: 'info',
    title: 'Consejo de Carga',
    message: 'Hemos notado que cargas frecuentemente por debajo del 20% o por encima del 80%. Esto reduce la vida útil de la batería. Tu score de cuidado ha bajado a 3.5⭐.',
    icon: Battery,
  },

  // Conducción agresiva
  aggressive_driving: {
    id: 'aggr_drive',
    type: 'vehicle_use',
    severity: 'warning',
    title: 'Conducción Agresiva Detectada',
    message: 'Se detectaron múltiples frenadas bruscas y aceleraciones rápidas. Este estilo de conducción aumenta el desgaste del vehículo y reduce la autonomía.',
    icon: Gauge,
  },

  // Uso fuera de zona permitida
  geofence_violation: {
    id: 'geo_viol',
    type: 'vehicle_use',
    severity: 'warning',
    title: '📍 Vehículo Fuera de Zona',
    message: 'El vehículo salió de la zona de operación permitida (Colombia). Esto viola los términos del contrato. Regresa a la zona autorizada.',
    icon: Navigation,
  },

  // Mantenimiento vencido
  maintenance_overdue: {
    id: 'maint_over',
    type: 'vehicle_use',
    severity: 'warning',
    title: 'Mantenimiento Vencido',
    message: 'Tu vehículo superó los 10,000 km sin mantenimiento. Agenda tu cita de servicio lo antes posible para mantener la garantía.',
    icon: AlertTriangle,
  },
};
