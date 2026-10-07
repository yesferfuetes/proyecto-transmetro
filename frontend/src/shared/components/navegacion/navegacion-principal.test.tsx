import { render, screen, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Destino } from './destinos';
import { NavegacionPrincipal } from './navegacion-principal';
import { RejillaMosaicos } from './rejilla-mosaicos';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

const DESTINOS: Destino[] = [
  { href: '/inicio', etiqueta: 'Inicio', icono: 'inicio', roles: [] },
  { href: '/alertas', etiqueta: 'Alertas', icono: 'alertas', roles: [] },
  { href: '/flota', etiqueta: 'Flota', icono: 'bus', roles: [] },
  { href: '/lineas', etiqueta: 'Líneas', icono: 'lineas', roles: [] },
  { href: '/estaciones', etiqueta: 'Estaciones', icono: 'estaciones', roles: [] },
  { href: '/reportes', etiqueta: 'Reportes', icono: 'reportes', roles: [] },
];

describe('NavegacionPrincipal', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/inicio');
  });

  it('dibuja la barra lateral con todos los destinos y el usuario', () => {
    render(
      <NavegacionPrincipal
        destinos={DESTINOS}
        usuario={{ nombre: 'Ana López', rol: 'Supervisor municipal' }}
      />,
    );

    const [lateral] = screen.getAllByRole('navigation', { name: 'Principal' });
    expect(within(lateral).getAllByRole('link')).toHaveLength(6);
    expect(within(lateral).getByText('Ana López')).toBeInTheDocument();
    expect(within(lateral).getByText('Supervisor municipal')).toBeInTheDocument();
  });

  it('en la barra inferior muestra cuatro destinos y "Más" con el resto', () => {
    render(<NavegacionPrincipal destinos={DESTINOS} usuario={{ nombre: 'Ana', rol: 'Rol' }} />);

    const [, inferior] = screen.getAllByRole('navigation', { name: 'Principal' });
    expect(within(inferior).getAllByRole('link')).toHaveLength(4);
    expect(within(inferior).getByRole('button', { name: 'Más' })).toBeInTheDocument();
  });
});

describe('RejillaMosaicos', () => {
  it('dibuja un mosaico enlazado por destino, en orden', () => {
    render(<RejillaMosaicos mosaicos={DESTINOS.slice(1, 4)} />);

    const enlaces = screen.getAllByRole('link');
    expect(enlaces.map((enlace) => enlace.textContent)).toEqual(['Alertas', 'Flota', 'Líneas']);
    expect(enlaces[0]).toHaveAttribute('href', '/alertas');
  });
});
