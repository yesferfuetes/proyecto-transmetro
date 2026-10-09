import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { asignarLinea } from '../actions/asignar-linea';
import { CambioDeLinea } from './cambio-de-linea';

vi.mock('../actions/asignar-linea', () => ({ asignarLinea: vi.fn() }));

const LINEAS = [
  { valor: '1', etiqueta: 'L1 · Línea 1 (4 de 6 buses)' },
  { valor: '2', etiqueta: 'L2 · Línea 2 (6 de 6 buses)' },
];

function dibujar(): void {
  render(<CambioDeLinea busId={7} lineaId={1} lineas={LINEAS} />);
}

describe('CambioDeLinea', () => {
  beforeEach(() => {
    vi.mocked(asignarLinea).mockReset();
  });

  it('muestra el error del backend tal cual', async () => {
    vi.mocked(asignarLinea).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'FLOTA_MAXIMA_EXCEDIDA',
        mensaje: 'La línea 2 admite como máximo 6 buses y ya tiene 6.',
        detalles: [],
        estado: 422,
      },
    });
    dibujar();
    await userEvent.selectOptions(screen.getByLabelText('Línea del bus'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar línea' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'La línea 2 admite como máximo 6 buses y ya tiene 6.',
    );
    expect(asignarLinea).toHaveBeenCalledWith(7, { lineaId: '2' });
  });

  it('el aviso de éxito permanece tras guardar', async () => {
    vi.mocked(asignarLinea).mockResolvedValue({ ok: true });
    dibujar();
    await userEvent.selectOptions(screen.getByLabelText('Línea del bus'), '');
    await userEvent.click(screen.getByRole('button', { name: 'Cambiar línea' }));
    expect(await screen.findByText('Línea actualizada.')).toBeInTheDocument();
    expect(asignarLinea).toHaveBeenCalledWith(7, { lineaId: '' });
    expect(screen.getByText('Línea actualizada.')).toBeInTheDocument();
  });
});
