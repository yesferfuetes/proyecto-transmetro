import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuitarAsignacion } from './quitar-asignacion';

const quitarAsignacion = vi.hoisted(() => vi.fn());
vi.mock('../actions/quitar-asignacion', () => ({ quitarAsignacion }));

function dibujar(): void {
  render(
    <QuitarAsignacion accesoId={5} guardiaId={7} guardiaNombre="Ana Pérez" turno="06:00-14:00" />,
  );
}

const DISPARADOR = { name: 'Quitar a Ana Pérez del turno 06:00-14:00' };

describe('QuitarAsignacion', () => {
  it('pide confirmación con el nombre del guardia y no quita nada hasta confirmar', async () => {
    dibujar();

    await userEvent.click(screen.getByRole('button', DISPARADOR));

    expect(
      screen.getByRole('dialog', { name: '¿Quitar a Ana Pérez del turno 06:00-14:00?' }),
    ).toBeVisible();
    expect(quitarAsignacion).not.toHaveBeenCalled();
  });

  it('al cancelar con Esc el foco vuelve al disparador', async () => {
    dibujar();
    const disparador = screen.getByRole('button', DISPARADOR);

    await userEvent.click(disparador);
    await userEvent.keyboard('{Escape}');

    expect(disparador).toHaveFocus();
    expect(quitarAsignacion).not.toHaveBeenCalled();
  });

  it('al confirmar quita la asignación del acceso', async () => {
    quitarAsignacion.mockResolvedValue({ ok: true });
    dibujar();

    await userEvent.click(screen.getByRole('button', DISPARADOR));
    await userEvent.click(screen.getByRole('button', { name: 'Quitar del turno' }));

    expect(quitarAsignacion).toHaveBeenCalledWith(5, { guardiaId: 7, turno: '06:00-14:00' });
  });

  it('si el backend lo rechaza deja el diálogo abierto con su mensaje', async () => {
    quitarAsignacion.mockResolvedValue({
      ok: false,
      error: {
        codigo: 'ACCESO_SIN_GUARDIA',
        mensaje: 'Todo acceso necesita al menos un guardia; asigna otro antes de quitar este.',
        detalles: [],
        estado: 422,
      },
    });
    dibujar();

    await userEvent.click(screen.getByRole('button', DISPARADOR));
    await userEvent.click(screen.getByRole('button', { name: 'Quitar del turno' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('asigna otro antes de quitar este');
    expect(screen.getByRole('dialog')).toBeVisible();
  });
});
