# TIC Photobooth Next - versión clean

Versión más neutral/profesional: negro, blanco, grises, bordes sutiles y sin estética exagerada.

## Correr

```bash
npm install
npm run dev
```

Abrí:

```bash
http://localhost:3000
```

## Tiene

- Pantalla de inicio limpia.
- Cámara desde navegador.
- Countdown 3, 2, 1.
- 4 fotos.
- Flash sutil.
- Tira final estilo photobooth.
- Compartir / descargar / imprimir.
- Botón físico con Space.

## Placeholders

En `components/Photobooth.tsx`:

```ts
const EVENT_NAME = "TIC Experience";
const SCHOOL_NAME = "ORT";
const FRAME_LABEL = "TIC PHOTOBOOTH";
```

Frases de cada toma:

```ts
const POSE_PROMPTS = [
  "Primera foto",
  "Cambiá la pose",
  "Otra expresión",
  "Última foto",
];
```

## Botón físico

Usar un botón arcade USB o encoder USB configurado como tecla `Space`.
