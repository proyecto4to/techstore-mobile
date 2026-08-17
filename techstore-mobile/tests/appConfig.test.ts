import { validateBuildEnvironment } from '../app.config';

describe('configuración de builds', () => {
  test('acepta preview por LAN solamente en el puerto TechStore', () => {
    expect(() =>
      validateBuildEnvironment('preview', 'http://192.168.16.125:8090/api/v1'),
    ).not.toThrow();
  });

  test.each(['8080', '8181'])('rechaza el puerto reservado %s', (port) => {
    expect(() =>
      validateBuildEnvironment('preview', `http://192.168.16.125:${port}/api/v1`),
    ).toThrow('reservados');
  });

  test('rechaza production sin API', () => {
    expect(() => validateBuildEnvironment('production', '')).toThrow('obligatoria');
  });

  test.each([
    'http://tienda.example.com/api/v1',
    'https://localhost/api/v1',
    'https://192.168.16.125/api/v1',
  ])('rechaza una API no pública/segura en production: %s', (url) => {
    expect(() => validateBuildEnvironment('production', url)).toThrow('HTTPS público');
  });

  test('acepta una API HTTPS pública en production', () => {
    expect(() =>
      validateBuildEnvironment('production', 'https://api.techstore.example/api/v1'),
    ).not.toThrow();
  });
});
