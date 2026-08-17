import { ConfigContext, ExpoConfig } from 'expo/config';

const environment = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
const tenantSlug = process.env.EXPO_PUBLIC_TENANT_SLUG ?? '';

const privateProductionHosts = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(?:1[6-9]|2\d|3[01])\./,
  /^\[?::1\]?$/,
  /\.local$/i,
];

export function validateBuildEnvironment(appEnv: string, publicApiUrl: string) {
  if (!['development', 'preview', 'production'].includes(appEnv)) {
    throw new Error(`EXPO_PUBLIC_APP_ENV no válido: ${appEnv}`);
  }
  if (appEnv === 'development' && !publicApiUrl) return;
  if (!publicApiUrl) {
    throw new Error(`EXPO_PUBLIC_API_URL es obligatoria para builds ${appEnv}.`);
  }

  let url: URL;
  try {
    url = new URL(publicApiUrl);
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL debe ser una URL válida.');
  }
  if (!url.pathname.replace(/\/$/, '').endsWith('/api/v1')) {
    throw new Error('EXPO_PUBLIC_API_URL debe terminar en /api/v1.');
  }
  if (['8080', '8181'].includes(url.port)) {
    throw new Error('Los puertos 8080 y 8181 están reservados para GeneXus/Tomcat.');
  }
  if (appEnv === 'production') {
    const isPrivate = privateProductionHosts.some((pattern) => pattern.test(url.hostname));
    if (url.protocol !== 'https:' || isPrivate) {
      throw new Error('EXPO_PUBLIC_API_URL debe usar HTTPS público en producción.');
    }
  }
}

validateBuildEnvironment(environment, apiUrl);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  owner: 'proyecto4toano',
  name: 'TechStore',
  slug: 'techstore-mobile',
  description: 'TechStore — tecnología y comercio para Paraguay',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/techstore-icon.png',
  scheme: 'techstore',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0F172A',
  primaryColor: '#0F66E6',
  runtimeVersion: { policy: 'appVersion' },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.techstore.mobile',
    icon: './assets/images/techstore-icon.png',
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.techstore.mobile',
    // Android entrega las notificaciones por Firebase Cloud Messaging, y este
    // archivo es el que le dice a qué proyecto pertenece la app. Se incrusta al
    // compilar: sin él, el teléfono ni siquiera puede pedir su token de push.
    //
    // No está en el repositorio a propósito. Se descarga de la consola de
    // Firebase (Configuración del proyecto → Tus apps → Android) y va en la raíz
    // de esta carpeta; sin ese archivo el build falla, que es mejor a que salga
    // un APK mudo sin que nadie lo note.
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      backgroundColor: '#0F172A',
      foregroundImage: './assets/images/techstore-icon.png',
    },
    blockedPermissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_CONTACTS',
      'android.permission.WRITE_CONTACTS',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.MANAGE_EXTERNAL_STORAGE',
    ],
    predictiveBackGestureEnabled: true,
  },
  web: {
    output: 'static',
    favicon: './assets/images/techstore-icon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
        faceIDPermission: 'Permitir que TechStore use Face ID para proteger tu sesión.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/techstore-icon.png',
        color: '#0F66E6',
        defaultChannel: 'techstore-default',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          usesCleartextTraffic: environment !== 'production',
        },
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Permitir que TechStore use Face ID para desbloquear tu sesión.',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0F172A',
        image: './assets/images/techstore-icon.png',
        imageWidth: 112,
        dark: {
          backgroundColor: '#0F172A',
          image: './assets/images/techstore-icon.png',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    environment,
    apiUrl,
    tenantSlug,
    eas: {
      projectId: 'fd7d5b88-62cc-453e-834d-1940a56aaebc',
    },
  },
});
