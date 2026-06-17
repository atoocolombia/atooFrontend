# Dongfeng Aeolus Sky EV 01 — fotos adicionales

Sube aquí imágenes de la **camioneta blanca** Dongfeng Aeolus Sky EV 01.

## Cómo añadir fotos

1. Copia tus archivos a esta carpeta, por ejemplo:
   - `lateral.jpg`
   - `interior.jpg`
   - `maletero.jpg`

2. Abre `src/app/data/vehicles.ts`

3. En el vehículo `dongfeng-aeolus-sky-ev01`, agrega las rutas al arreglo `gallery`:

```ts
gallery: [
  '/vehicles/dongfeng-aeolus-sky-ev01/main.png',
  '/vehicles/dongfeng-aeolus-sky-ev01/gallery/lateral.jpg',
  '/vehicles/dongfeng-aeolus-sky-ev01/gallery/interior.jpg',
],
```

4. Haz commit y push para ver los cambios en producción.

## Formatos recomendados

- JPG o PNG
- Horizontal, mínimo 1200px de ancho
