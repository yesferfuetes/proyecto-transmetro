import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResumenErrores } from './resumen-errores';

describe('ResumenErrores', () => {
  it('se anuncia como alerta y recibe el foco al aparecer', () => {
    render(<ResumenErrores mensaje="No se pudo guardar el bus." />);

    const alerta = screen.getByRole('alert');
    expect(alerta).toHaveTextContent('No se pudo guardar el bus.');
    expect(alerta).toHaveFocus();
  });

  it('enlaza cada error con su campo', () => {
    render(
      <ResumenErrores
        mensaje="Revisa los campos marcados."
        errores={[
          { campoId: 'placa', mensaje: 'La placa es obligatoria.' },
          { campoId: 'capacidad', mensaje: 'La capacidad debe ser mayor que cero.' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'La placa es obligatoria.' })).toHaveAttribute(
      'href',
      '#placa',
    );
    expect(
      screen.getByRole('link', { name: 'La capacidad debe ser mayor que cero.' }),
    ).toHaveAttribute('href', '#capacidad');
  });
});
