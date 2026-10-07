import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Aviso } from './aviso';

describe('Aviso', () => {
  it('un error se anuncia de inmediato', () => {
    render(<Aviso estado="error" titulo="No se pudo guardar." />);

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar.');
  });

  it('los demás avisos se anuncian con cortesía y muestran su detalle', () => {
    render(
      <Aviso estado="advertencia" titulo="Flota insuficiente">
        La línea 12 tiene menos buses que estaciones.
      </Aviso>,
    );

    const aviso = screen.getByRole('status');
    expect(aviso).toHaveClass('border-l-warning');
    expect(aviso).toHaveTextContent('La línea 12 tiene menos buses que estaciones.');
  });
});
