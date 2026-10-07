import { render, screen, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LayoutPanel from './layout';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

describe('LayoutPanel', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/inicio');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('envuelve el contenido en el main enfocable y muestra el usuario de la sesión', async () => {
    render(await LayoutPanel({ children: <p>Contenido</p> }));

    const principal = screen.getByRole('main');
    expect(principal).toHaveAttribute('id', 'contenido');
    expect(principal).toHaveAttribute('tabindex', '-1');
    expect(principal).toHaveTextContent('Contenido');
    expect(screen.getByText('Supervisor de ejemplo')).toBeInTheDocument();
    expect(screen.getByText('Supervisor municipal')).toBeInTheDocument();
  });

  it('solo el administrador ve Usuarios en la navegación', async () => {
    const { unmount } = render(await LayoutPanel({ children: null }));
    const [lateral] = screen.getAllByRole('navigation', { name: 'Principal' });
    expect(within(lateral).queryByRole('link', { name: 'Usuarios' })).toBeNull();
    unmount();

    vi.stubEnv('ROL_DE_EJEMPLO', 'administrador');
    render(await LayoutPanel({ children: null }));
    const [lateralAdministrador] = screen.getAllByRole('navigation', { name: 'Principal' });
    expect(
      within(lateralAdministrador).getByRole('link', { name: 'Usuarios' }),
    ).toBeInTheDocument();
  });
});
