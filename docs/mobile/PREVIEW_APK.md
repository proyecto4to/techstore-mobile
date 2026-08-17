# APK Android — candidato de Fase 15

**Estado:** generado, descargado y verificado técnicamente; pendiente aceptación manual  
**Fecha:** 2026-08-16  
**Dispositivo objetivo:** Xiaomi Redmi Note 8 Pro  
**Código incluido:** Fases 0 a 15.

## APK entregado

| Dato | Valor |
| --- | --- |
| Proyecto EAS | `@proyecto4toano/techstore-mobile` |
| Build ID | `7932b96d-2eb3-4519-b032-c62e8d8fcbd5` |
| Estado EAS | `FINISHED` |
| Perfil | `preview` / distribución interna / APK autónomo |
| Versión | `1.0.0` |
| versionCode | `12` |
| Expo SDK | `57.0.0` |
| Android package | `com.techstore.mobile` |
| Tamaño | 124.892.476 bytes (119,11 MiB) |
| SHA-256 | `38CA7485A4E05B4974963AAD00DB5117C0015C2CB6DECF91A9E16405CB01C214` |
| Expiración estimada del enlace directo | `2026-08-29 01:10 UTC` |

Descarga directa:

<https://expo.dev/artifacts/eas/SmGkBt5u6UUwKLO_Lpk97IUTwB-c_53RutzzvV8JB54.apk>

Página persistente del build:

<https://expo.dev/accounts/proyecto4toano/projects/techstore-mobile/builds/7932b96d-2eb3-4519-b032-c62e8d8fcbd5>

La URL directa es temporal. Si expira, la página conserva el registro; si Expo ya retiró el archivo, se debe generar otro APK con `eas build --platform android --profile preview`.

## Por qué el v12 reemplaza al v11

El v11 quedó inservible para esta red: lleva incorporada la IP `192.168.16.125`, que la PC ya no tiene. La URL de la API se resuelve al compilar, no en tiempo de ejecución, así que un cambio de IP obliga a un build nuevo. El v12 se generó con la IP vigente y es el único candidato válido mientras la PC conserve esa dirección.

Verificado el 2026-08-16: v11 y v12 comparten el mismo certificado de firma (`793E0D04D7E78B8569A83295ED7C62A53A684069BFB7F9DF798D6FCAEA2EC88B`, esquema v2) y el `versionCode` sube de 11 a 12, así que el v12 se instala como actualización sobre el v11 sin desinstalar ni perder datos.

## Verificación técnica

- ZIP/APK legible y firma Android v2 válida, leída del bloque de firma con `scripts/inspect-apk-signature.mjs`.
- Certificado idéntico al de los APK anteriores que sí se instalaban; validez hasta 2053.
- Contiene bibliotecas `arm64-v8a`, `armeabi-v7a` y `x86_64`; el Redmi queda cubierto por ARM64.
- Escaneo de secretos aprobado. `assets/expo-root.pem` es el certificado raíz público de Expo, no una clave privada.
- Copia local ignorada por Git: `artifacts/device-e2e/techstore-mobile-1.0.0-preview-v12.apk`, en el repositorio del backend.

## Red configurada

- API: `http://192.168.100.8:8090/api/v1`
- WebSocket: `ws://192.168.100.8:8090/ws`

Antes de probar, iniciar TechStore y conectar teléfono y PC a la misma Wi-Fi. La API usa `8090`; `8080` y `8181` quedan reservados para GeneXus/Tomcat. Este APK no necesita Metro ni Expo Go.

Si la PC vuelve a cambiar de IP, este APK deja de conectar y hay que compilar otro. Para evitar repetirlo, conviene reservar la IP en el router por dirección MAC.

## Instalación en Xiaomi

1. Abrir el enlace directo desde el teléfono y descargar el APK.
2. Abrirlo desde Descargas o el gestor de archivos.
3. Si MIUI lo solicita, permitir temporalmente **Instalar apps desconocidas** para esa aplicación.
4. Pulsar **Instalar** y luego **Abrir**.
5. Revocar el permiso después de instalar si ya no se necesita.

No requiere root, bootloader desbloqueado, ROM personalizada, Expo Go ni Metro.

## Checklist de aceptación manual

- [ ] Splash, icono, registro, login, persistencia y cierre de sesión.
- [ ] Home, catálogo, búsqueda, filtros, detalle, favoritos e importes en guaraníes.
- [ ] Carrito persistente y revalidación de precio/stock.
- [ ] Direcciones, cotización, entrega, pago y checkout idempotente.
- [ ] Pedidos, detalle y timeline de tracking.
- [ ] Chat móvil ↔ Admin Web, no leídos, lectura y reconexión.
- [ ] Permiso push, centro de notificaciones y navegación desde una notificación.
- [ ] Bloqueo biométrico opcional y fallback seguro.
- [ ] Safe areas, teclado, scroll, tamaño de texto, fluidez y ausencia de cortes.

La Fase 15 sólo podrá marcarse aceptada después de completar este checklist en el dispositivo físico.

## Si Android muestra “No se instaló la app”

Android acepta una actualización sólo si coinciden package y firma y el `versionCode` no disminuye. Las tres condiciones están verificadas para el v12, así que el mensaje genérico de MIUI apunta a otra causa:

1. Eliminar únicamente el archivo APK fallido de la carpeta **Descargas**; no desinstalar todavía la app que funciona.
2. Confirmar que la descarga terminó por completo antes de abrirla y disponer de al menos 500 MB libres durante la instalación.
3. Abrirlo desde **Archivos/Descargas**, aceptar la actualización y el aviso de fuente desconocida.
4. Si vuelve a fallar, no borrar datos: conectar el teléfono por USB y obtener el código exacto con `adb install -r archivo.apk`. El mensaje de MIUI no permite distinguir falta de espacio, política del instalador o conflicto residual.
