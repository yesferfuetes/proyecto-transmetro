import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TarjetaBloqueada } from './tarjeta-bloqueada';

const EXPLICACION =
  'Disponible para supervisores municipales. Si lo necesitas, solicita el cambio de rol al administrador.';

describe('TarjetaBloqueada', () => {
  it('atenúa la vista previa y la saca del foco y del árbol accesible', () => {
    const { container } = render(
      <TarjetaBloqueada titulo="Reportes" icono="reportes" explicacion={EXPLICACION} />,
    );

    const vistaPrevia = container.querySelector('[inert]');
    expect(vistaPrevia).not.toBeNull();
    expect(vistaPrevia).toHaveAttribute('aria-hidden', 'true');
    expect(vistaPrevia).toContainElement(screen.getByText('Reportes'));
  });

  it('explica en texto pleno qué rol la permite', () => {
    render(<TarjetaBloqueada titulo="Reportes" icono="reportes" explicacion={EXPLICACION} />);

    expect(screen.getByText(EXPLICACION)).toBeVisible();
  });

  it('como vista de acceso denegado tiene título y enlace de regreso', () => {
    render(
      <TarjetaBloqueada
        variante="pagina"
        titulo="Usuarios"
        icono="usuarios"
        explicacion={EXPLICACION}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Esta función no está disponible para tu rol' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute(
      'href',
      '/inicio',
    );
  });
});
