import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Destino } from './destinos';
import { HojaMas } from './hoja-mas';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

const SOBRANTES: Destino[] = [
  { href: '/pilotos', etiqueta: 'Pilotos', icono: 'pilotos', roles: ['supervisor'] },
  { href: '/reportes', etiqueta: 'Reportes', icono: 'reportes', roles: ['supervisor'] },
];

describe('HojaMas', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/inicio');
  });

  it('abre una hoja con los destinos que no caben en la barra', async () => {
    render(<HojaMas destinos={SOBRANTES} />);

    await userEvent.click(screen.getByRole('button', { name: 'Más' }));

    const hoja = screen.getByRole('dialog', { name: 'Más opciones' });
    expect(within(hoja).getByRole('link', { name: 'Pilotos' })).toHaveAttribute('href', '/pilotos');
    expect(within(hoja).getByRole('link', { name: 'Reportes' })).toBeInTheDocument();
  });

  it('Esc la cierra y devuelve el foco al botón "Más"', async () => {
    render(<HojaMas destinos={SOBRANTES} />);
    const boton = screen.getByRole('button', { name: 'Más' });

    await userEvent.click(boton);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(boton).toHaveFocus();
  });

  it('elegir un destino cierra la hoja', async () => {
    render(<HojaMas destinos={SOBRANTES} />);

    await userEvent.click(screen.getByRole('button', { name: 'Más' }));
    await userEvent.click(screen.getByRole('link', { name: 'Pilotos' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
