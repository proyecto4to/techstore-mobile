# TechStore Mobile

Cliente móvil de TechStore: Expo SDK 57, React Native 0.86, React 19 y TypeScript estricto. Android, iOS y web desde el mismo código.

La aplicación consume la API de TechStore, que vive en un repositorio aparte: [proyecto4to/techstore](https://github.com/proyecto4to/techstore) (Spring Boot + React + PostgreSQL). Ese backend es la única autoridad sobre permisos, precios, stock, pagos, tenant y fiscalidad; el teléfono muestra lo que el servidor resuelve.

## Estado

Fases 1 a 14 cerradas y validadas. La Fase 15 tiene los builds terminados —development build, APK interno firmado y AAB, los tres `FINISHED`— pero **no está aceptada**: falta correr el checklist manual en el dispositivo físico.

| Producto | Última validación |
| --- | --- |
| TypeScript, ESLint y Jest | 22 suites / 60 pruebas |
| Expo Doctor | 20/20 |
| Maestro (validación estática) | 5 flujos, 31 selectores |
| Firma y contenido del APK | verificados con `apksig` |

El detalle de cada fase está en [docs/mobile/](docs/mobile), una nota de cierre por fase, y el estado de la última en [PHASE_15.md](docs/mobile/PHASE_15.md).

## Estructura

```
techstore-mobile/        La aplicación Expo
docs/mobile/             Cierre de las 15 fases, arquitectura, seguridad, builds
docs/api/                Contrato OpenAPI del que se generan los tipos del cliente
scripts/                 E2E por ADB, inspección de firma de APK, gates de CI
.easignore               Qué NO se sube al build remoto de EAS
```

## Empezar

```powershell
cd techstore-mobile
npm ci
Copy-Item .env.example .env.local
npm run check
npm start
```

Las instrucciones completas —variables de entorno, development build, Expo Go, web y accesos directos— están en [techstore-mobile/README.md](techstore-mobile/README.md) y en [docs/mobile/SETUP.md](docs/mobile/SETUP.md).

## Qué falta para cerrar la Fase 15

1. Levantar el backend y poner teléfono y PC en la misma Wi-Fi.
2. Instalar el APK interno y recorrer el [checklist de aceptación](docs/mobile/PREVIEW_APK.md).
3. Recompilar si cambió la IP de la PC: la URL de la API queda incorporada en el build.

Para Google Play hace falta una API pública por HTTPS y el perfil `production`; para iOS, credenciales Apple. Ninguna de las dos cosas está en este repositorio.
