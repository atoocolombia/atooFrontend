import type { LucideIcon } from 'lucide-react';
import {
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  Percent,
  Shield,
  TrendingUp,
  Trophy,
  Wrench,
} from 'lucide-react';

export interface HeroSectionContent {
  badge: string;
  titleBefore: string;
  titleHighlight: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  videoUrl: string;
  posterUrl: string;
  videoStoredPath: string | null;
  posterStoredPath: string | null;
  videoMimeType: string | null;
  posterMimeType: string | null;
  video: string;
  poster: string;
}

export interface BenefitItem {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

export interface BenefitsSectionContent {
  badge: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  description: string;
  items: BenefitItem[];
}

export interface StepItem {
  number: string;
  icon: string;
  title: string;
  description: string;
}

export interface StepsSectionContent {
  badge: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  description: string;
  ctaText: string;
  ctaNote: string;
  items: StepItem[];
}

export interface ContactSectionContent {
  badge: string;
  titleBefore: string;
  titleHighlight: string;
  titleAfter: string;
  description: string;
  driverCount: string;
  phoneLabel: string;
  phone: string;
  emailLabel: string;
  email: string;
  trustItems: string[];
}

export interface LandingContent {
  hero: HeroSectionContent;
  benefits: BenefitsSectionContent;
  steps: StepsSectionContent;
  contact: ContactSectionContent;
}

export const BENEFIT_ICON_OPTIONS = [
  { value: 'trending-up', label: 'Tendencia' },
  { value: 'shield', label: 'Escudo' },
  { value: 'clock', label: 'Reloj' },
  { value: 'heart', label: 'Corazón' },
  { value: 'wrench', label: 'Herramienta' },
  { value: 'percent', label: 'Porcentaje' },
] as const;

export const STEP_ICON_OPTIONS = [
  { value: 'file-text', label: 'Documento' },
  { value: 'check-circle-2', label: 'Aprobación' },
  { value: 'car', label: 'Vehículo' },
  { value: 'trophy', label: 'Trofeo' },
] as const;

const BENEFIT_ICONS: Record<string, LucideIcon> = {
  'trending-up': TrendingUp,
  shield: Shield,
  clock: Clock,
  heart: Heart,
  wrench: Wrench,
  percent: Percent,
};

const STEP_ICONS: Record<string, LucideIcon> = {
  'file-text': FileText,
  'check-circle-2': CheckCircle2,
  car: Car,
  trophy: Trophy,
};

export function resolveBenefitIcon(key: string): LucideIcon {
  return BENEFIT_ICONS[key] ?? TrendingUp;
}

export function resolveStepIcon(key: string): LucideIcon {
  return STEP_ICONS[key] ?? FileText;
}

export function defaultLandingContent(): LandingContent {
  return {
    hero: {
      badge: 'Genera ingresos con tu vehículo',
      titleBefore: 'Drive Today, ',
      titleHighlight: 'Yours Tomorrow',
      description:
        'Modelo Rent to Own: trabaja con tu auto eléctrico, paga una cuota semanal accesible y, al completar el plazo, el vehículo es tuyo.',
      primaryButtonText: 'Comenzar Ahora',
      secondaryButtonText: 'Ver Cómo Funciona',
      videoUrl: '/hero/hero-bg.mp4',
      posterUrl: '/hero/hero-poster.jpg',
      videoStoredPath: null,
      posterStoredPath: null,
      videoMimeType: null,
      posterMimeType: null,
      video: '/hero/hero-bg.mp4',
      poster: '/hero/hero-poster.jpg',
    },
    benefits: {
      badge: 'Beneficios atoo',
      titleBefore: '¿Por Qué Elegir ',
      titleHighlight: 'atoo',
      titleAfter: '?',
      description:
        'Tu propio vehículo mientras generas ingresos, con un plan claro, cuotas semanales y camino a la propiedad.',
      items: [
        {
          icon: 'trending-up',
          title: 'Ingresos con tu vehículo',
          description:
            'Cuota semanal fija. Lo que generes trabajando con tu auto queda para ti.',
          gradient: 'from-[#1A1FE8] to-[#3D42F0]',
        },
        {
          icon: 'shield',
          title: 'Sin Enganche',
          description: 'Recibe tu vehículo sin enganche y empieza a generar ingresos desde el primer día.',
          gradient: 'from-cyan-500 to-[#1A1FE8]',
        },
        {
          icon: 'clock',
          title: 'Proceso Rápido',
          description: 'Aprobación en 24 horas. Mínimos requisitos y trámites simples.',
          gradient: 'from-emerald-500 to-teal-600',
        },
        {
          icon: 'heart',
          title: 'Seguro Incluido',
          description: 'Todos nuestros vehículos incluyen seguro de cobertura amplia.',
          gradient: 'from-[#1A1FE8] to-[#6B70F5]',
        },
        {
          icon: 'wrench',
          title: 'Mantenimiento',
          description: 'Servicio y mantenimiento preventivo incluido durante el periodo de renta.',
          gradient: 'from-orange-500 to-amber-500',
        },
        {
          icon: 'percent',
          title: 'Mejores Tasas',
          description: 'Tasas competitivas y transparentes. Sin cargos ocultos.',
          gradient: 'from-[#3D42F0] to-[#1A1FE8]',
        },
      ],
    },
    steps: {
      badge: 'Proceso Simple',
      titleBefore: '¿Cómo ',
      titleHighlight: 'Funciona',
      titleAfter: '?',
      description: 'En 4 pasos tendrás tu vehículo listo para trabajar y generar ingresos',
      ctaText: 'Iniciar Mi Solicitud',
      ctaNote: '⚡ Respuesta en menos de 24 horas',
      items: [
        {
          number: '01',
          icon: 'file-text',
          title: 'Solicitud',
          description:
            'Completa el formulario en línea con tus datos básicos. Solo necesitas INE y comprobante de domicilio.',
        },
        {
          number: '02',
          icon: 'check-circle-2',
          title: 'Aprobación',
          description:
            'Nuestro equipo revisa tu solicitud y te contacta en menos de 24 horas con una respuesta.',
        },
        {
          number: '03',
          icon: 'car',
          title: 'Entrega',
          description:
            'Elige tu vehículo, firma el contrato y empieza a generar ingresos con él el mismo día.',
        },
        {
          number: '04',
          icon: 'trophy',
          title: '¡Es Tuyo!',
          description:
            'Después de 60 meses de pagos semanales puntuales, el vehículo pasa a tu nombre.',
        },
      ],
    },
    contact: {
      badge: '¡Comienza Tu Viaje Hoy!',
      titleBefore: '¿Listo para ',
      titleHighlight: 'Yours Tomorrow',
      titleAfter: '?',
      description:
        'Únete a más de {count} que ya generan ingresos con su vehículo y construyen patrimonio',
      driverCount: '100 socios atoo',
      phoneLabel: 'Llámanos',
      phone: '55 1234 5678',
      emailLabel: 'Escríbenos',
      email: 'hola@atoo.com',
      trustItems: ['Aprobación en 24h', 'Sin enganche', 'Pagos semanales'],
    },
  };
}

export function splitContactDescription(description: string, driverCount: string): [string, string] {
  if (!description.includes('{count}')) {
    return [description, ''];
  }
  const [before, after] = description.split('{count}');
  return [before, after ?? ''];
}
