import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cambiarBusDePiloto } from '../actions/cambiar-bus-de-piloto';
import { CambioDeBus } from './cambio-de-bus';

vi.mock('../actions/cambiar-bus-de-piloto', () => ({ cambiarBusDePiloto: vi.fn() }));

const BUSES = [
  { valor: '1', etiqueta: 'TM-0001 · línea 1 (2 pilotos)' },
  { valor: '2', etiqueta: 'TM-0002 · sin línea (1 piloto)' },
];

function dibujar(): void {
  render(<CambioDeBus pilotoId={7} busId={1} buses={BUSES} />);
}

describe('CambioDeBus', () => {
  beforeEach(() => {
    vi.mocked(cambiarBusDePiloto).mockReset();
  });

  it('muestra el error del backend tal cual', async () => {
    vi.mocked(cambiarBusDePiloto).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'BUS_DE_BAJA',
        mensaje: 'El bus TM-0002 está de baja.',
        detalles: [],
        estado: 422,
      },
    });
    dibujar();
    await userEvent.selectOptions(screen.getByLabelText('Bus del piloto'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar bus' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('El bus TM-0002 está de baja.');
    expect(cambiarBusDePiloto).toHaveBeenCalledWith(7, { busId: '2' });
  });

  it('el aviso de éxito permanece tras guardar', async () => {
    vi.mocked(cambiarBusDePiloto).mockResolvedValue({ ok: true });
    dibujar();
    await userEvent.selectOptions(screen.getByLabelText('Bus del piloto'), '');
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar bus' }));
    expect(await screen.findByText('Bus actualizado.')).toBeInTheDocument();
    expect(cambiarBusDePiloto).toHaveBeenCalledWith(7, { busId: '' });
    expect(screen.getByText('Bus actualizado.')).toBeInTheDocument();
  });
});
