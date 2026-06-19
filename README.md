# TIC Photobooth Next - versión clean

Photobooth de kiosko: la persona entra, se para frente a la cámara, toca **un** botón,
se sacan 4 fotos, se arma la tira y **se imprime sola**. Después vuelve solo al estado
listo para la próxima persona. Sin diálogos, sin clics.

## Correr

```bash
npm install
cp .env.local.example .env.local   # configurá tu impresora (ver abajo)
npm run dev
```

Abrí:

```bash
http://localhost:3000
```

## Flujo automático

```
intro ──(botón)──▶ cámara lista ──(botón)──▶ countdown 3·2·1
   ▲                                              │
   │                                              ▼
   └────── vuelve solo ◀── "retirá tu foto" ◀── 4 fotos ▶ tira ▶ IMPRIME (silencioso)
```

El primer botón (intro) lo aprieta el operador una vez para dar permiso de cámara.
A partir de ahí cada persona sólo toca el botón una vez y el resto es automático.

## Elementos necesarios

**Hardware**
- **Una computadora** conectada a la impresora (corre esta app + el servidor de impresión).
- **Cámara**: webcam USB (o cámara integrada).
- **Pantalla**: el monitor de la compu, o un dispositivo aparte mostrando `http://<ip-de-la-compu>:3000` (la impresión la sigue haciendo la compu que tiene la impresora).
- **Botón físico**: botón arcade USB o encoder USB configurado para mandar la tecla `Space`.
- **Impresora**: térmica de fotos (DNP/Mitsubishi para tiras 2x6) o cualquiera instalada en el sistema.

**Software**
- Node.js + esta app Next.js.
- Para impresión silenciosa:
  - **Windows**: [SumatraPDF](https://www.sumatrapdfreader.org) (recomendado) o `mspaint` (ya incluido).
  - **macOS / Linux**: CUPS (`lp`), ya incluido.

La API `app/api/print/route.ts` detecta el sistema operativo sola.

## Impresión automática — Windows (el del evento)

1. Instalá la impresora en Windows e imprimí una página de prueba.
2. (Recomendado) Descargá **SumatraPDF** portable y anotá la ruta del `.exe`.
3. Mirá el nombre exacto de la impresora abriendo `http://localhost:3000/api/print`.
4. Completá `.env.local`:
   ```
   PRINTER_NAME=Nombre Exacto De La Impresora
   PRINT_COPIES=1
   SUMATRA_PATH=C:\Tools\SumatraPDF\SumatraPDF.exe
   ```
   - Si dejás `SUMATRA_PATH` vacío, usa `mspaint /pt` (también silencioso). En ese caso
     configurá el **tamaño de papel en las preferencias del driver** de la impresora,
     porque mspaint imprime con el papel default del driver.
5. Reiniciá `npm run dev`. Cada sesión se imprime sola.

> Si `PRINTER_NAME` queda vacío, usa la impresora default del sistema.

## Impresión automática — macOS / Linux

Mismo flujo, pero el papel se setea por env (`PRINT_MEDIA`, ej. `4x6.Borderless`
o `Custom.2x6in`) y las impresoras se listan con `lpstat -p -d`.

## Modo kiosko (recomendado para el evento)

- **Windows** — Chrome a pantalla completa:
  ```bat
  "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://localhost:3000
  ```
- **macOS**:
  ```bash
  open -a "Google Chrome" --args --kiosk --app=http://localhost:3000
  ```
- Dar permiso de cámara una sola vez (el sitio lo recuerda en localhost).
- Para producción real: `npm run build && npm start` en vez de `dev`.

## Placeholders

En `lib/stripRenderer.ts`:

```ts
const EVENT_NAME = "TIC Experience";
const SCHOOL_NAME = "ORT";
const FRAME_LABEL = "TIC PHOTOBOOTH";
```

Frases de cada toma en `hooks/usePhotobooth.ts` (`POSE_PROMPTS`).

## Tiempos ajustables

En `hooks/usePhotobooth.ts`:
- `CAPTURE_DELAY_MS` — pausa entre fotos.
- `DONE_SCREEN_MS` — cuánto se muestra "retirá tu foto" antes de reiniciar.
