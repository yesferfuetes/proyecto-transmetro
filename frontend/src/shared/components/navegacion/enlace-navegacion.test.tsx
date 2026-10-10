import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import type { Destino } from './destinos';
import { EnlaceNavegacion } from './enlace-navegacion';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

const FLOTA: Destino = { href: '/flota', etiqueta: 'Flota', icono: 'bus', roles: ['supervisor'] };

describe('EnlaceNavegacion', () => {
  it('en su ruta se marca como página actual y se realza', () => {
    vi.mocked(usePathname).mockReturnValue('/flota/12');
    render(<EnlaceNavegacion destino={FLOTA} forma="lateral" />);

    const enlace = screen.getByRole('link', { name: 'Flota' });
    expect(enlace).toHaveAttribute('aria-current', 'page');
    expect(enlace).toHaveClass('bg-night');
  });

  it('en otra ruta no se marca', () => {
    vi.mocked(usePathname).mockReturnValue('/inicio');
    render(<EnlaceNavegacion destino={FLOTA} forma="inferior" />);

    const enlace = screen.getByRole('link', { name: 'Flota' });
    expect(enlace).not.toHaveAttribute('aria-current');
    expect(enlace).toHaveAttribute('href', '/flota');
  });

  it('con pendientes los muestra y los anuncia; con cero no muestra nada', () => {
    vi.mocked(usePathname).mockReturnValue('/inicio');
    const { rerender } = render(
      <EnlaceNavegacion destino={{ ...FLOTA, contador: 4 }} forma="lateral" />,
    );

    expect(screen.getByRole('link', { name: 'Flota, 4 pendientes' })).toBeInTheDocument();

    rerender(<EnlaceNavegacion destino={{ ...FLOTA, contador: 1 }} forma="lateral" />);
    expect(screen.getByRole('link', { name: 'Flota, 1 pendiente' })).toBeInTheDocument();

    rerender(<EnlaceNavegacion destino={{ ...FLOTA, contador: 0 }} forma="lateral" />);
    expect(screen.getByRole('link', { name: 'Flota' })).toBeInTheDocument();
  });
});
