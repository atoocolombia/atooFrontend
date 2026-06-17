import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const vehiclesRoot = path.resolve(__dirname, '../public/vehicles');
const outFile = path.resolve(__dirname, '../src/app/data/vehicleGalleries.generated.ts');

const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

/** @type {Record<string, string[]>} */
const galleries = {};

if (fs.existsSync(vehiclesRoot)) {
  for (const slug of fs.readdirSync(vehiclesRoot)) {
    const galleryDir = path.join(vehiclesRoot, slug, 'gallery');
    if (!fs.existsSync(galleryDir) || !fs.statSync(galleryDir).isDirectory()) continue;

    const files = fs
      .readdirSync(galleryDir)
      .filter((name) => IMAGE_RE.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name) => `/vehicles/${slug}/gallery/${name}`);

    if (files.length > 0) {
      galleries[slug] = files;
    }
  }
}

const contents = `// Archivo generado por scripts/sync-vehicle-galleries.mjs — no editar a mano.
import type { CatalogVehicle } from './vehicles';

export const vehicleGalleryFiles: Record<string, string[]> = ${JSON.stringify(galleries, null, 2)};

export function getVehicleGalleryImages(vehicle: CatalogVehicle): string[] {
  const extra = vehicleGalleryFiles[vehicle.slug] ?? [];
  const merged = [vehicle.image, ...extra.filter((src) => src !== vehicle.image)];
  return [...new Set(merged)];
}
`;

fs.writeFileSync(outFile, contents, 'utf8');
console.log(`Galerías sincronizadas → ${path.relative(process.cwd(), outFile)}`);
