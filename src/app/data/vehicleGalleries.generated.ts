// Archivo generado por scripts/sync-vehicle-galleries.mjs — no editar a mano.
import type { CatalogVehicle } from './vehicles';

export const vehicleGalleryFiles: Record<string, string[]> = {
  "dongfeng-aeolus-sky-ev01": [
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9112.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9113.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9114.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9115.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9116.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9117.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9118.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9119.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9120.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9121.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9122.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9123.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9124.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9125.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9126.JPG",
    "/vehicles/dongfeng-aeolus-sky-ev01/gallery/IMG_9127.JPG"
  ],
  "dongfeng-nammi": [
    "/vehicles/dongfeng-nammi/gallery/IMG_2439.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_2442.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_2443.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_2444.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_2445.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_2446.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_2447.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_2448.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_2449.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9933.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9934.WEBP",
    "/vehicles/dongfeng-nammi/gallery/IMG_9935.WEBP",
    "/vehicles/dongfeng-nammi/gallery/IMG_9936.WEBP",
    "/vehicles/dongfeng-nammi/gallery/IMG_9937.WEBP",
    "/vehicles/dongfeng-nammi/gallery/IMG_9938.WEBP",
    "/vehicles/dongfeng-nammi/gallery/IMG_9939.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9943.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9946.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9949.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9951.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9952.JPG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9955.PNG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9956.PNG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9957.PNG",
    "/vehicles/dongfeng-nammi/gallery/IMG_9958.PNG"
  ]
};

export function getVehicleGalleryImages(vehicle: CatalogVehicle): string[] {
  const extra = vehicleGalleryFiles[vehicle.slug] ?? [];
  const merged = [vehicle.image, ...extra.filter((src) => src !== vehicle.image)];
  return [...new Set(merged)];
}
