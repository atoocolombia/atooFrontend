# Video de fondo del Hero (landing)

Sube aquí el video que se reproduce detrás del título principal.

## Archivo obligatorio

| Archivo | Ruta completa |
|---------|----------------|
| **`hero-bg.mp4`** | `frontend/public/hero/hero-bg.mp4` |

Ese es el único nombre que usa la landing. No renombres a otro.

## Archivo opcional (mientras carga el video)

| Archivo | Descripción |
|---------|-------------|
| **`hero-poster.jpg`** | Imagen estática que se ve un instante antes de que arranque el video |

## Recomendaciones del video

- **Formato:** MP4 (codec H.264)
- **Orientación:** horizontal (16:9)
- **Resolución:** 1920×1080 o 1280×720
- **Peso:** idealmente menos de 15 MB (Vercel y móviles cargan más rápido)
- **Duración:** 10–30 segundos (se repite en bucle)
- **Sin audio** (el hero lo reproduce en silencio)

## Después de subir

```bash
cd ~/Desktop/Atoo/frontend
git add public/hero/hero-bg.mp4
git commit -m "Add hero background video"
git push origin main
```

Vercel redesplegará solo y el video aparecerá en la sección **Drive Today, Yours Tomorrow**.
