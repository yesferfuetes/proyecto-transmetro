import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { desactivarUsuario } from '../actions/desactivar-usuario';
import { reactivarUsuario } from '../actions/reactivar-usuario';
import { AccionesDeEstadoUsuario } from './acciones-de-estado-usuario';

vi.mock('../actions/desactivar-usuario', () => ({ desactivarUsuario: vi.fn() }));
vi.mock('../actions/reactivar-usuario', () => ({ reactivarUsuario: vi.fn() }));

describe('AccionesDeEstadoUsuario', () => {
  it('pide confirmación antes de desactivar', async () => {
    vi.mocked(desactivarUsuario).mockResolvedValue({ ok: true });
    render(<AccionesDeEstadoUsuario id={5} nombre="Luis Pérez" activo />);

    await userEvent.click(screen.getByRole('button', { name: 'Desactivar' }));
    const dialogo = screen.getByRole('dialog', { name: '¿Desactivar a Luis Pérez?' });
    expect(desactivarUsuario).not.toHaveBeenCalled();

    await userEvent.click(within(dialogo).getByRole('button', { name: 'Desactivar' }));
    expect(desactivarUsuario).toHaveBeenCalledWith(5);
  });

  it('muestra el rechazo del backend al desactivar', async () => {
    vi.mocked(desactivarUsuario).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'AUTODESACTIVACION_NO_PERMITIDA',
        mensaje: 'No puedes desactivar tu propia cuenta.',
        detalles: [],
        estado: 422,
      },
    });
    render(<AccionesDeEstadoUsuario id={1} nombre="Admin" activo />);

    await userEvent.click(screen.getByRole('button', { name: 'Desactivar' }));
    const dialogo = screen.getByRole('dialog', { name: '¿Desactivar a Admin?' });
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Desactivar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No puedes desactivar tu propia cuenta.',
    );
  });

  it('reactiva sin confirmación a un usuario inactivo', async () => {
    vi.mocked(reactivarUsuario).mockResolvedValue({ ok: true });
    render(<AccionesDeEstadoUsuario id={5} nombre="Luis Pérez" activo={false} />);

    await userEvent.click(screen.getByRole('button', { name: 'Reactivar' }));

    expect(reactivarUsuario).toHaveBeenCalledWith(5);
  });
});
