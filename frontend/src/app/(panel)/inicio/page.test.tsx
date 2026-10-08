import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { exigirSesion } from '@/shared/lib/sesion/sesion';
import type { Sesion } from '@/shared/schemas/sesion';
import ErrorDeInicio from './error';
import CargandoInicio from './loading';
import Inicio from './page';

vi.mock('@/shared/lib/sesion/sesion', () => ({ exigirSesion: vi.fn() }));

const SUPERVISOR: Sesion = {
  id: 2,
  nombre: 'Ana López',
  correo: 'ana@transmetro.test',
  rol: 'SUPERVISOR_MUNICIPAL',
  estacion: null,
};

function mosaicos(): string[] {
  const accesos = screen.getByRole('region', { name: 'Accesos rápidos' });
  return within(accesos)
    .getAllByRole('link')
    .map((enlace) => enlace.textContent ?? '');
}

describe('Inicio', () => {
  it('saluda al usuario de la sesión con su rol', async () => {
    vi.mocked(exigirSesion).mockResolvedValue(SUPERVISOR);
    render(await Inicio());

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Inicio');
    expect(screen.getByText('Ana López · Supervisor municipal')).toBeVisible();
  });

  it('el supervisor ve los mosaicos de su menú, en orden y sin Usuarios', async () => {
    vi.mocked(exigirSesion).mockResolvedValue(SUPERVISOR);
    render(await Inicio());

    expect(mosaicos()).toEqual(['Líneas', 'Estaciones', 'Municipalidades']);
  });

  it('el administrador ve además el acceso a Usuarios, al final', async () => {
    vi.mocked(exigirSesion).mockResolvedValue({ ...SUPERVISOR, rol: 'ADMINISTRADOR' });
    render(await Inicio());

    expect(mosaicos()).toEqual(['Líneas', 'Estaciones', 'Municipalidades', 'Usuarios']);
  });

  it('el operador ve su estación', async () => {
    vi.mocked(exigirSesion).mockResolvedValue({
      ...SUPERVISOR,
      rol: 'OPERADOR_ESTACION',
      estacion: { id: 1, codigo: 'E001', nombre: 'San Sebastián' },
    });
    render(await Inicio());

    expect(screen.getByText('Ana López · Operador de estación en San Sebastián')).toBeVisible();
    expect(mosaicos()).not.toContain('Usuarios');
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
