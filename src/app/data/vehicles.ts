export interface VehicleSpec {
  label: string;
  value: string;
}

export interface CatalogVehicle {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  type: 'carro' | 'camioneta';
  image: string;
  /** Rutas en public/vehicles/{slug}/gallery/ — añade más al subir fotos */
  gallery: string[];
  highlights: string[];
  features: string[];
  specs: VehicleSpec[];
  badge: string | null;
  popular: boolean;
  weeklyPriceCop: number;
  /** PDF de ficha técnica (desde API o ruta estática) */
  specSheetPdf?: string | null;
}

export const catalogVehicles: CatalogVehicle[] = [
  {
    id: 'dongfeng-nammi',
    slug: 'dongfeng-nammi',
    name: 'Dongfeng Nammi',
    subtitle: 'Eléctrico compacto ideal para la ciudad',
    type: 'carro',
    image: '/vehicles/dongfeng-nammi/main.png',
    gallery: ['/vehicles/dongfeng-nammi/main.png'],
    highlights: [
      'Diseño compacto y eficiente para uso diario en ciudad',
      'Bajo costo de operación y mantenimiento eléctrico',
      'Tecnología de asistencia al conductor (ADAS)',
      'Pantalla central inteligente con conectividad',
      'Ideal para plataformas de transporte y movilidad urbana',
    ],
    features: [
      '100% eléctrico',
      'Carga rápida DC',
      'Bluetooth y conectividad',
      'Cámara de reversa',
      'ADAS de serie',
    ],
    specs: [
      { label: 'Tipo', value: 'Hatchback eléctrico' },
      { label: 'Autonomía', value: 'Hasta ~430 km (CLTC)' },
      { label: 'Motor', value: 'Eléctrico ~70 kW' },
      { label: 'Batería', value: 'Litio fosfato / alta densidad' },
      { label: 'Carga rápida', value: 'DC compatible' },
      { label: 'Pasajeros', value: '5' },
      { label: 'Tracción', value: 'Delantera' },
      { label: 'Uso recomendado', value: 'Ciudad y apps de movilidad' },
    ],
    badge: 'Más Popular',
    popular: true,
    weeklyPriceCop: 207_000,
  },
  {
    id: 'dongfeng-aeolus-sky-ev01',
    slug: 'dongfeng-aeolus-sky-ev01',
    name: 'Dongfeng Aeolus Sky EV 01',
    subtitle: 'SUV eléctrica con mayor espacio y autonomía',
    type: 'camioneta',
    image: '/vehicles/dongfeng-aeolus-sky-ev01/main.png',
    gallery: ['/vehicles/dongfeng-aeolus-sky-ev01/main.png'],
    highlights: [
      'SUV eléctrica con mayor espacio interior y de carga',
      'Autonomía extendida para trayectos urbanos e interurbanos',
      'Diseño moderno con iluminación LED y aerodinámica optimizada',
      'Confort superior para conductor y pasajeros',
      'Excelente opción para familias y trabajo con mayor capacidad',
    ],
    features: [
      'SUV 100% eléctrica',
      'Mayor autonomía',
      'Espacio amplio',
      'LED delanteros y traseros',
      'Asistencias a la conducción',
    ],
    specs: [
      { label: 'Tipo', value: 'SUV eléctrica' },
      { label: 'Autonomía', value: 'Hasta ~500 km (CLTC)' },
      { label: 'Motor', value: 'Eléctrico de alto torque' },
      { label: 'Batería', value: 'Paquete de alta capacidad' },
      { label: 'Carga rápida', value: 'DC de alta potencia' },
      { label: 'Pasajeros', value: '5' },
      { label: 'Espacio de carga', value: 'Amplio maletero SUV' },
      { label: 'Uso recomendado', value: 'Ciudad, familia y trabajo' },
    ],
    badge: null,
    popular: false,
    weeklyPriceCop: 207_000,
  },
];

export function getVehicleById(id: string): CatalogVehicle | undefined {
  return catalogVehicles.find((v) => v.id === id);
}

export function formatCop(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

/** PDF de ficha técnica: API o public/vehicles/{slug}/ficha-tecnica.pdf */
export function getVehicleSpecSheetPdf(vehicle: CatalogVehicle): string {
  if (vehicle.specSheetPdf) return vehicle.specSheetPdf;
  return `/vehicles/${vehicle.slug}/ficha-tecnica.pdf`;
}

export function getVehicleSpecSheetFilename(vehicle: CatalogVehicle): string {
  const safeName = vehicle.name.replace(/\s+/g, '-');
  return `Ficha-tecnica-${safeName}.pdf`;
}
