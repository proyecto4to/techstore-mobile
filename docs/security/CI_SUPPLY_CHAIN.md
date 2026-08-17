# CI y cadena de suministro

**Vigente desde:** 2026-08-13  
**Workflow:** `.github/workflows/ci.yml`

Esta política nació en el repositorio de backend/web, cuando la aplicación móvil todavía vivía ahí. Al separarse quedó una copia con la parte que aplica al móvil; la del otro repositorio ([proyecto4to/techstore](https://github.com/proyecto4to/techstore/blob/main/docs/security/CI_SUPPLY_CHAIN.md)) cubre Java y la web. Los dos gates compartidos —`scripts/ci-security-check.mjs` y `scripts/review-sbom-licenses.mjs`— son el mismo código en ambos lados.

## Qué bloquea una integración

Cada push o pull request a `main` ejecuta jobs independientes y sin secretos de producción:

- Repositorio: nombres de credenciales, claves/certificados, marcadores de secretos, uso activo de puertos reservados y actions sin SHA completo.
- Mobile: `npm ci`, TypeScript, ESLint, Jest, validación Maestro, perfiles EAS, Expo config, Expo Doctor, export Android Hermes, `npm audit`, SBOM, licencias e inspección del export.
- SAST: CodeQL para JavaScript/TypeScript. En repositorios privados se ejecuta al definir la variable de repositorio `ENABLE_CODEQL=true`, porque depende de que GitHub Advanced Security esté habilitado.

Los jobs tienen `permissions` mínimos, `timeout`, cancelación de ejecuciones obsoletas y acciones fijadas a SHA. Dependabot revisa semanalmente GitHub Actions y el árbol npm de la aplicación.

## Política de dependencias

`npm audit --omit=dev --audit-level=critical` bloquea vulnerabilidades críticas en dependencias de producción. Las severidades inferiores no se ocultan: quedan visibles en el log y deben corregirse con una actualización compatible, nunca mediante un downgrade forzado de Expo.

Baseline al cerrar Fase 14:

| Árbol | Críticas | Altas | Moderadas |
| --- | ---: | ---: | ---: |
| Mobile producción | 0 | 15 | 8 |

La deuda proviene del toolchain Expo/Metro. `npm audit fix --force` propone bajar Expo a SDK 53 y está prohibido porque rompe la compatibilidad de SDK 57. Dependabot y Expo Doctor son los mecanismos de seguimiento.

El SBOM se genera en formato CycloneDX JSON. La revisión automática rechaza licencias de distribución fuerte no aprobadas (AGPL/GPL-3, SSPL, BUSL/Commons Clause); no sustituye una revisión legal previa a publicación comercial.

## Secretos y artefactos

`scripts/ci-security-check.mjs` falla ante:

- nuevos `.p12`, `.pfx`, `.pem`, `.key`, `.jks`, `.keystore`, credenciales Google/Firebase/Apple o `.env` reales;
- marcadores reconocibles de claves privadas y tokens comunes;
- nombres de secretos de servidor dentro del código móvil;
- uso activo de `8080` o `8181` fuera de documentación;
- credenciales inyectadas en el workflow;
- archivos sensibles dentro del export Android.

`assets/expo-root.pem` es la única ruta `.pem` admitida: es el certificado raíz **público** de Expo, no una clave privada, y se acepta sólo por su ruta exacta.

Las variables `EXPO_PUBLIC_*` quedan incorporadas al bundle y son legibles por cualquiera que tenga el APK. Nunca deben contener contraseñas, tokens ni secretos.

## Evidencia y retención

El SBOM se conserva como artifact de GitHub Actions durante 14 días. El CI no compila APK/AAB ni recibe credenciales de firma: esos artefactos se generan con EAS y su secret store. Para distribución, conservar además URL/ID de build, hash descargado, perfil EAS, versión y resultado del escaneo del binario.

## Reproducción local

```powershell
node scripts/ci-security-check.mjs

cd techstore-mobile
npm ci
npm run check
npm run e2e:validate
npm run build:validate
npm run doctor
$env:EXPO_PUBLIC_APP_ENV = 'preview'
$env:EXPO_PUBLIC_API_URL = 'http://127.0.0.1:8090/api/v1'
npx expo export --platform android --output-dir dist-ci
node ..\scripts\ci-security-check.mjs --artifact dist-ci
```

Los puertos `8080` y `8181` permanecen reservados para GeneXus/Tomcat. Metro usa `8081` y la API TechStore usa `8090`.
