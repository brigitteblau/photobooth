# Guardar las fotos en Google Drive

Cada foto que se manda a imprimir se sube también a una carpeta de Google Drive.
Como Google no deja subir solo con el link, usamos un **Google Apps Script** de
tu propia cuenta (la dueña del Drive). Se configura una vez.

## Paso 1 — Crear el Apps Script

1. Entrá a 👉 https://script.google.com → **Nuevo proyecto**.
2. Borrá lo que haya y pegá este código:

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var folder = DriveApp.getFolderById("1dmLcZaP6P7HQQxP5nU8EGSEub7UOWmmF");
  var bytes = Utilities.base64Decode(data.image);
  var name = data.name || ("tic-" + Date.now() + ".jpg");
  var blob = Utilities.newBlob(bytes, data.mime || "image/jpeg", name);
  var file = folder.createFile(blob);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, id: file.getId() }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

> El ID `1dmLcZaP6P7HQQxP5nU8EGSEub7UOWmmF` es el de tu carpeta (sale del link).
> Si cambiás de carpeta, reemplazá ese ID.

## Paso 2 — Desplegar como Web App

1. Botón **Implementar (Deploy) → Nueva implementación**.
2. Tipo: **Aplicación web (Web app)**.
3. **Ejecutar como:** Yo (tu cuenta).
4. **Quién tiene acceso:** Cualquier persona (Anyone).
5. **Implementar** → autorizá los permisos que pida.
6. Copiá la **URL del Web App** (termina en `/exec`).

## Paso 3 — Configurar la app

En `.env.local`:

```
DRIVE_UPLOAD_URL=https://script.google.com/macros/s/XXXXX/exec
```

Reiniciá `npm run dev`. Listo: cada foto impresa se guarda sola en la carpeta.

## Notas

- La subida necesita **internet** en la compu del evento. Si la red bloquea
  Google (firewall), la impresión igual funciona; solo no sube a Drive.
- Si Drive falla, NO frena ni rompe la impresión (es "best effort").
