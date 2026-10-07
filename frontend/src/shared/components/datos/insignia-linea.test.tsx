import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InsigniaLinea } from './insignia-linea';

describe('InsigniaLinea', () => {
  it('muestra el número y se anuncia como "Línea N"', () => {
    const { container } = render(<InsigniaLinea codigo="12" />);

    expect(screen.getByText('Línea 12')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass('bg-linea-12', 'text-ink');
  });

  it('la Ruta 5 se anuncia por su nombre', () => {
    render(<InsigniaLinea codigo="R5" />);

    expect(screen.getByText('Ruta 5')).toBeInTheDocument();
  });

  it('agrega contorno a las líneas claras sobre fondo claro', () => {
    const { container } = render(<InsigniaLinea codigo="6" />);

    expect(container.firstElementChild).toHaveClass('ring-1', 'ring-border-strong');
  });
});
