import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { Hoja } from './hoja';

function ConDisparador(): ReactElement {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAbierto(true)}>
        Filtros
      </button>
      <Hoja abierto={abierto} alCerrar={() => setAbierto(false)} titulo="Filtros">
        <p>Contenido de la hoja</p>
      </Hoja>
    </>
  );
}

describe('Hoja', () => {
  it('abre como modal y se cierra con el botón Cerrar devolviendo el foco', async () => {
    render(<ConDisparador />);
    const disparador = screen.getByRole('button', { name: 'Filtros' });

    await userEvent.click(disparador);
    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(disparador).toHaveFocus();
  });

  it('se presenta pegada al borde inferior', async () => {
    render(<ConDisparador />);

    await userEvent.click(screen.getByRole('button', { name: 'Filtros' }));

    expect(screen.getByRole('dialog')).toHaveClass('mt-auto', 'mb-0', 'rounded-t-xl');
  });
});
