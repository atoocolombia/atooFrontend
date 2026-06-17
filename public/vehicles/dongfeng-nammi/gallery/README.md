# Dongfeng Nammi — fotos adicionales

Sube aquí imágenes del **Dongfeng Nammi** (carro azul).

## Cómo añadir fotos

1. Copia tus archivos a esta carpeta, por ejemplo:
   - `interior.jpg`
   - `trasera.jpg`
   - `detalle-pantalla.png`

2. Abre `src/app/data/vehicles.ts`

3. En el vehículo `dongfeng-nammi`, agrega las rutas al arreglo `gallery`:

```ts
gallery: [
  '/vehicles/dongfeng-nammi/main.png',
  '/vehicles/dongfeng-nammi/gallery/interior.jpg',
  '/vehicles/dongfeng-nammi/gallery/trasera.jpg',
],
```

4. Haz commit y push para ver los cambios en producción.

## Formatos recomendados

- JPG o PNG
- Horizontal, mínimo 1200px de ancho
