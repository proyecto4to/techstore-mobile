import { render } from '@testing-library/react-native';

import { Button, Input, Price, formatPyg } from '@/components/ui';
import { AppThemeProvider } from '@/theme';

describe('componentes base', () => {
  it('formatea guaraníes sin decimales', () => {
    expect(formatPyg(350_000)).toMatch(/350\.000/);
  });

  it('expone el botón como control accesible', async () => {
    const screen = await render(
      <AppThemeProvider>
        <Button>Continuar</Button>
      </AppThemeProvider>,
    );

    expect(screen.getByRole('button', { name: 'Continuar' })).toBeTruthy();
  });

  it('muestra el precio recibido', async () => {
    const screen = await render(
      <AppThemeProvider>
        <Price value={1_250_000} />
      </AppThemeProvider>,
    );

    expect(screen.getByText(/1\.250\.000/)).toBeTruthy();
  });

  it('asocia la etiqueta y el error con el campo de texto', async () => {
    const screen = await render(
      <AppThemeProvider>
        <Input label="Correo" error="Ingresá un correo válido." />
      </AppThemeProvider>,
    );

    expect(screen.getByLabelText('Correo').props.accessibilityHint).toBe('Ingresá un correo válido.');
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresá un correo válido.');
  });
});
