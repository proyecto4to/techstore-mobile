const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const eas = JSON.parse(fs.readFileSync(path.join(root, 'eas.json'), 'utf8'));
const ignore = fs.readFileSync(path.resolve(root, '..', '.easignore'), 'utf8');

function fail(message) {
  throw new Error(`[build:validate] ${message}`);
}

function assertPreviewUrl(profileName) {
  const profile = eas.build?.[profileName];
  if (!profile) fail(`Falta el perfil ${profileName}.`);
  if (profile.env?.EXPO_PUBLIC_APP_ENV !== 'preview') fail(`${profileName} no usa el entorno preview.`);
  const value = profile.env?.EXPO_PUBLIC_API_URL;
  if (!value) fail(`${profileName} no define EXPO_PUBLIC_API_URL.`);
  const url = new URL(value);
  if (!url.pathname.replace(/\/$/, '').endsWith('/api/v1')) {
    fail(`${profileName} debe apuntar a la API en /api/v1.`);
  }
  // Hay dos formas legitimas de alcanzar la API: por la red local, donde el
  // puerto va explicito, o por una URL publica HTTPS, donde el 443 es implicito
  // y no aparece. Exigir 8090 siempre dejaba fuera la segunda.
  const esLan = url.protocol === 'http:';
  if (esLan && url.port !== '8090') fail(`${profileName} en HTTP debe usar el puerto 8090.`);
  if (!esLan && url.port !== '' && url.port !== '8090') {
    fail(`${profileName} en HTTPS debe usar el puerto estandar o 8090.`);
  }
  if (['8080', '8181'].includes(url.port)) fail(`${profileName} usa un puerto reservado.`);
}

if (!/^>= 21\.8\.0$/.test(eas.cli?.version ?? '')) fail('EAS CLI debe estar fijado como >= 21.8.0.');
if (eas.cli?.appVersionSource !== 'remote') fail('El versionado de tienda debe administrarse en EAS.');
if (eas.build?.development?.developmentClient !== true) fail('development debe generar un development client.');

assertPreviewUrl('development');
assertPreviewUrl('preview');
assertPreviewUrl('store-preview');

if (eas.build.preview.distribution !== 'internal' || eas.build.preview.android?.buildType !== 'apk') {
  fail('preview debe ser distribución interna APK.');
}
if (eas.build['store-preview'].android?.buildType !== 'app-bundle') {
  fail('store-preview debe generar AAB.');
}

const production = eas.build?.production;
if (production?.environment !== 'production' || production?.env?.EXPO_PUBLIC_APP_ENV !== 'production') {
  fail('production debe resolver el entorno EAS/Expo production.');
}
if (production.env?.EXPO_PUBLIC_API_URL) {
  fail('La API de producción debe venir del entorno EAS, no quedar versionada en eas.json.');
}
if (production.android?.buildType !== 'app-bundle') fail('production debe generar AAB.');

for (const rule of ['/techstore-backend/', '/techstore-frontend/', '.env*', '*.p12', '*.key', 'credentials.json', 'tests/', 'e2e/']) {
  if (!ignore.includes(rule)) fail(`.easignore no contiene la regla ${rule}.`);
}

const serialized = JSON.stringify(eas);
for (const secret of ['JWT_SECRET', 'POSTGRES_PASSWORD', 'SMTP_PASSWORD', 'SIFEN_PASSWORD']) {
  if (serialized.includes(secret)) fail(`eas.json contiene el nombre sensible ${secret}.`);
}

console.log('BUILD_CONFIG_OK profiles=4 apiPort=8090 productionApi=EAS_ENV');
