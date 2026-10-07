import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ErrorDeInicio from './error';
import CargandoInicio from './loading';
import Inicio from './page';

describe('Inicio', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('muestra las alertas activas de toda la red como cifra protagonista', async () => {
    render(await Inicio());

    const franja = screen.getByRole('region', { name: 'Resumen de alertas' });
    expect(within(franja).getByText(/Alertas de capacidad activas · toda la red/)).toBeVisible();
    expect(within(franja).getByText('5')).toBeVisible();
    expect(within(franja).getByText('3 sobrecupo')).toBeVisible();
    expect(within(franja).getByText('2 baja ocupación')).toBeVisible();
    expect(within(franja).getByRole('link', { name: 'Ver alertas' })).toHaveAttribute(
      'href',
      '/alertas',
    );
  });

  it('el supervisor ve los seis accesos rápidos en orden y sin Usuarios', async () => {
    render(await Inicio());

    const accesos = screen.getByRole('region', { name: 'Accesos rápidos' });
    expect(
      within(accesos)
        .getAllByRole('link')
        .map((enlace) => enlace.textContent),
    ).toEqual(['Líneas', 'Estaciones', 'Flota', 'Pilotos', 'Alertas', 'Reportes']);
  });

  it('el administrador ve además el acceso a Usuarios', async () => {
    vi.stubEnv('ROL_DE_EJEMPLO', 'administrador');
    render(await Inicio());

    const accesos = screen.getByRole('region', { name: 'Accesos rápidos' });
    expect(within(accesos).getByRole('link', { name: 'Usuarios' })).toHaveAttribute(
      'href',
      '/usuarios',
    );
  });

  it('el operador ve solo las alertas de su estación', async () => {
    vi.stubEnv('ROL_DE_EJEMPLO', 'operador');
    render(await Inicio());

    expect(screen.getByText(/Alertas de capacidad activas · Estación El Trébol/)).toBeVisible();
    const tabla = screen.getByRole('table', { name: 'Últimas alertas de capacidad activas' });
    expect(within(tabla).getAllByRole('row')).toHaveLength(3);
  });

  it('lista las alertas recientes con su línea, ocupación y estado', async () => {
    render(await Inicio());

    const tabla = screen.getByRole('table', { name: 'Últimas alertas de capacidad activas' });
    const fila = within(tabla).getByRole('row', { name: /El Trébol/ });
    expect(within(fila).getByText('Línea 12')).toBeInTheDocument();
    expect(within(fila).getByText('182 %')).toBeVisible();
    expect(within(fila).getByText('Sobrecupo')).toBeVisible();
  });
});

describe('estados de carga y error de Inicio', () => {
  it('mientras carga anuncia la espera', () => {
    render(<CargandoInicio />);

    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('ante un error lo anuncia y permite reintentar', async () => {
    const reset = vi.fn();
    render(<ErrorDeInicio reset={reset} />);

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el inicio');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
