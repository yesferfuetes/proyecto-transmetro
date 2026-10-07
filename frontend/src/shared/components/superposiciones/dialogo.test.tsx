import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Dialogo } from './dialogo';

function ConDisparador({
  variante,
  alConfirmar,
}: Readonly<{ variante: 'confirmacion' | 'destructivo'; alConfirmar: () => void }>): ReactElement {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setAbierto(true)}>
        Desactivar bus
      </button>
      <Dialogo
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        titulo="¿Desactivar el bus P-123ABC?"
        variante={variante}
        confirmacion={{ texto: 'Desactivar', alConfirmar }}
      >
        <p>El bus deja de estar disponible para asignarse.</p>
      </Dialogo>
    </>
  );
}

describe('Dialogo', () => {
  it('abre como modal con su título como nombre accesible', async () => {
    render(<ConDisparador variante="confirmacion" alConfirmar={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Desactivar bus' }));

    expect(screen.getByRole('dialog', { name: '¿Desactivar el bus P-123ABC?' })).toBeVisible();
  });

  it('Esc lo cierra y devuelve el foco al disparador', async () => {
    render(<ConDisparador variante="confirmacion" alConfirmar={vi.fn()} />);
    const disparador = screen.getByRole('button', { name: 'Desactivar bus' });

    await userEvent.click(disparador);
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(disparador).toHaveFocus();
  });

  it('Cancelar lo cierra sin confirmar', async () => {
    const alConfirmar = vi.fn();
    render(<ConDisparador variante="confirmacion" alConfirmar={alConfirmar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Desactivar bus' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(alConfirmar).not.toHaveBeenCalled();
  });

  it('la variante destructiva confirma con el botón de peligro', async () => {
    const alConfirmar = vi.fn();
    render(<ConDisparador variante="destructivo" alConfirmar={alConfirmar} />);

    await userEvent.click(screen.getByRole('button', { name: 'Desactivar bus' }));
    const confirmar = screen.getByRole('button', { name: 'Desactivar' });
    await userEvent.click(confirmar);

    expect(confirmar).toHaveClass('bg-danger');
    expect(alConfirmar).toHaveBeenCalledOnce();
  });
});
