import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Paginacion } from './paginacion';

const href = (pagina: number): string => `?pagina=${pagina}`;

describe('Paginacion', () => {
  it('en una página intermedia enlaza la anterior y la siguiente', () => {
    render(<Paginacion pagina={3} totalPaginas={12} hrefDePagina={href} />);

    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument();
    expect(screen.getByText('Página 3 de 12')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Anterior' })).toHaveAttribute('href', '?pagina=2');
    expect(screen.getByRole('link', { name: 'Siguiente' })).toHaveAttribute('href', '?pagina=4');
  });

  it('en los extremos deshabilita el enlace que no aplica', () => {
    const { rerender } = render(<Paginacion pagina={1} totalPaginas={2} hrefDePagina={href} />);
    expect(screen.queryByRole('link', { name: 'Anterior' })).toBeNull();
    expect(screen.getByText('Anterior').closest('[aria-disabled]')).toBeInTheDocument();

    rerender(<Paginacion pagina={2} totalPaginas={2} hrefDePagina={href} />);
    expect(screen.queryByRole('link', { name: 'Siguiente' })).toBeNull();
  });
});
