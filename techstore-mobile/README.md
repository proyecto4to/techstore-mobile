# TechStore Mobile

Aplicación móvil y web de TechStore, construida con Expo SDK 57, React Native 0.86, React 19 y TypeScript estricto. Home, catálogo, búsqueda, favoritos, carrito, direcciones, checkout, cotización, tracking e historial de pedidos consumen la API segura y comparten la identidad visual oscura oficial del frontend web.

## Estado actual

La implementación y los builds de Fase 15 están terminados; resta la aceptación manual en el Xiaomi. La aplicación permite recorrer cinco pestañas (`Inicio`, `Buscar`, `Carrito`, `Pedidos` y `Cuenta`) e iniciar o crear una sesión real. Incluye catálogo/favoritos, carrito revalidado, direcciones, entrega, pago, checkout idempotente, tracking, historial, chat recuperable, push, centro de notificaciones y bloqueo biométrico opcional. Spring Boot sigue siendo la fuente de verdad para permisos, precios, stock, pagos, tenant y fiscalidad.

## Inicio rápido

Requisitos: Node.js 22.13 o posterior y npm. El entorno validado para esta fase fue Node `24.18.0` con npm `11.16.0`.

```powershell
cd "C:\Users\Dell Vostro\OneDrive\Documentos\GitHub\techstore\techstore-mobile"
npm ci
Copy-Item .env.example .env.local
npm run check
npm start
```

Completá `.env.local` con valores de desarrollo antes de conectar servicios:

```dotenv
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://192.168.1.50:8090/api/v1
EXPO_PUBLIC_TENANT_SLUG=mi-tienda
```

Las variables `EXPO_PUBLIC_*` quedan incorporadas al bundle y nunca deben contener contraseñas, tokens ni secretos. `API_URL` debe incluir `/api/v1`. `TENANT_SLUG` se valida y queda disponible para la futura resolución de tiendas; el backend todavía resuelve las solicitudes anónimas al tenant predeterminado.

## Dónde ver la aplicación

### Android: development build recomendado

La referencia de aceptación es un **development build**, porque reproduce el runtime nativo configurado por el proyecto. La primera compilación puede generarse con EAS:

```powershell
npx eas-cli@latest build --platform android --profile development
npx expo start --dev-client
```

La compilación remota requiere una cuenta de Expo. La primera ejecución puede pedir asociar el proyecto con EAS; revisá el cambio de configuración antes de confirmarlo en Git. Instalá el APK interno indicado por EAS, mantené el teléfono y la PC en la misma red y escaneá el QR del servidor de desarrollo.

Con Android Studio, SDK y JDK configurados también se puede crear el cliente localmente:

```powershell
npx expo run:android
```

Después de tener el development build instalado, `npm run android` abre el proyecto en el dispositivo o emulador disponible.

Expo Go sirve como vista rápida y limitada de parte de la interfaz:

```powershell
npx expo start --go
```

No debe usarse para aprobar la aplicación: los plugins de configuración, el comportamiento nativo y los flujos de producción se validan en un development build.

### Web

```powershell
npm run web
```

Expo muestra la URL local en la terminal. Para comprobar el export estático de producción:

```powershell
npm run build:web
```

El resultado se genera en `dist/`, carpeta ignorada por Git.

### Acceso directo de Windows

`TechStore Mobile - En vivo` ejecuta `abrir-techstore-mobile.ps1` desde la raíz del repositorio. El lanzador comprueba una respuesta HTTP real en `127.0.0.1:8081`; si detecta un Expo propio colgado, reinicia solo ese proceso y guarda diagnóstico en `.expo/shortcut-stdout.log` / `.expo/shortcut-stderr.log`. Si otro programa ocupa el puerto, informa el conflicto sin detenerlo.

## Comandos

| Comando | Propósito |
| --- | --- |
| `npm start` | Inicia Metro/Expo. |
| `npm run android` | Abre el servidor y el destino Android disponible. |
| `npm run ios` | Abre el destino iOS; el simulador requiere macOS. |
| `npm run web` | Ejecuta la aplicación web en desarrollo. |
| `npm run typecheck` | Valida TypeScript sin emitir archivos. |
| `npm run lint` | Ejecuta Expo ESLint y no admite warnings. |
| `npm test` | Ejecuta Jest en serie. |
| `npm run test:watch` | Ejecuta Jest en modo interactivo. |
| `npm run check` | Ejecuta typecheck, lint y tests. |
| `npm run doctor` | Comprueba la coherencia del proyecto Expo. |
| `npm run build:web` | Exporta la aplicación web estática. |
| `npm run api:generate` | Regenera los tipos desde el contrato OpenAPI móvil. |
| `npm run e2e:validate` | Valida sintaxis, subflujos, variables y selectores Maestro. |
| `npm run build:validate` | Valida perfiles EAS y guardas de URL/entorno. |

## Documentación

- [Arquitectura](../docs/mobile/ARCHITECTURE.md)
- [Preparación del entorno](../docs/mobile/SETUP.md)
- [Desarrollo local](../docs/mobile/LOCAL_DEVELOPMENT.md)
- [Cierre de la Fase 1](../docs/mobile/PHASE_1.md)
- [Cierre de la Fase 2](../docs/mobile/PHASE_2.md)
- [Cierre de la Fase 3](../docs/mobile/PHASE_3.md)
- [Cierre de la Fase 4](../docs/mobile/PHASE_4.md)
- [Cierre de la Fase 4.5](../docs/mobile/PHASE_4_5.md)
- [Cierre de la Fase 5](../docs/mobile/PHASE_5.md)
- [Cierre de la Fase 6](../docs/mobile/PHASE_6.md)
- [Cierre de la Fase 7](../docs/mobile/PHASE_7.md)
- [Cierre de la Fase 8](../docs/mobile/PHASE_8.md)
- [Cierre de la Fase 9](../docs/mobile/PHASE_9.md)
- [Cierre de la Fase 10](../docs/mobile/PHASE_10.md)
- [Cierre de la Fase 11](../docs/mobile/PHASE_11.md)
- [Cierre de la Fase 12](../docs/mobile/PHASE_12.md)
- [Cierre de la Fase 13](../docs/mobile/PHASE_13.md)
- [Cierre de la Fase 14](../docs/mobile/PHASE_14.md)
- [Estado técnico de la Fase 15](../docs/mobile/PHASE_15.md)
- [APK e instalación](../docs/mobile/PREVIEW_APK.md)
- [Builds Android](../docs/mobile/BUILD_ANDROID.md)
- [Preparación iOS](../docs/mobile/BUILD_IOS.md)
- [Seguridad móvil](../docs/mobile/SECURITY.md)
- [CI y cadena de suministro](https://github.com/proyecto4to/techstore/blob/main/docs/security/CI_SUPPLY_CHAIN.md) — la política vive en el repositorio de backend/web
- [Auditoría móvil previa](../docs/mobile/MOBILE_AUDIT.md)

La documentación oficial de referencia debe consultarse en la versión exacta de [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/).
