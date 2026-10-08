import { render, screen, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exigirSesion } from '@/shared/lib/sesion/sesion';
import type { Sesion } from '@/shared/schemas/sesion';
import LayoutPanel from './layout';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));
vi.mock('@/shared/lib/sesion/sesion', () => ({ exigirSesion: vi.fn() }));
vi.mock('@/modules/usuarios', () => ({
  BotonCerrarSesion: (): React.ReactElement => <button type="submit">Cerrar sesión</button>,
}));

const SUPERVISOR: Sesion = {
  id: 2,
  nombre: 'Ana López',
  correo: 'ana@transmetro.test',
  rol: 'SUPERVISOR_MUNICIPAL',
  estacion: null,
};

function lateral(): HTMLElement {
  const [barra] = screen.getAllByRole('navigation', { name: 'Principal' });
  if (barra === undefined) {
    throw new Error('Falta la navegación principal.');
  }
  return barra;
}

describe('LayoutPanel', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/inicio');
  });

  it('exige sesión y muestra el usuario, su cuenta y el cierre de sesión', async () => {
    vi.mocked(exigirSesion).mockResolvedValue(SUPERVISOR);
    render(await LayoutPanel({ children: <p>Contenido</p> }));

    expect(exigirSesion).toHaveBeenCalledWith();
    const principal = screen.getByRole('main');
    expect(principal).toHaveAttribute('id', 'contenido');
    expect(principal).toHaveTextContent('Contenido');
    expect(within(lateral()).getByRole('link', { name: 'Ana López, mi cuenta' })).toHaveAttribute(
      'href',
      '/mi-cuenta',
    );
    expect(within(lateral()).getByText('Supervisor municipal')).toBeInTheDocument();
    expect(within(lateral()).getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('el operador ve su estación junto al rol', async () => {
    vi.mocked(exigirSesion).mockResolvedValue({
      ...SUPERVISOR,
      rol: 'OPERADOR_ESTACION',
      estacion: { id: 1, codigo: 'E001', nombre: 'San Sebastián' },
    });
    render(await LayoutPanel({ children: null }));

    expect(within(lateral()).getByText('Operador de estación · San Sebastián')).toBeInTheDocument();
  });

  it('solo el administrador ve Usuarios en la navegación', async () => {
    vi.mocked(exigirSesion).mockResolvedValue(SUPERVISOR);
    const { unmount } = render(await LayoutPanel({ children: null }));
    expect(within(lateral()).queryByRole('link', { name: 'Usuarios' })).toBeNull();
    expect(within(lateral()).getByRole('link', { name: 'Municipalidades' })).toBeInTheDocument();
    unmount();

    vi.mocked(exigirSesion).mockResolvedValue({ ...SUPERVISOR, rol: 'ADMINISTRADOR' });
    render(await LayoutPanel({ children: null }));
    expect(within(lateral()).getByRole('link', { name: 'Usuarios' })).toBeInTheDocument();
  });
});
