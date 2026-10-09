import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormularioAcceso } from './formulario-acceso';

const registrarAcceso = vi.hoisted(() => vi.fn());
const editarAcceso = vi.hoisted(() => vi.fn());
vi.mock('../actions/registrar-acceso', () => ({ registrarAcceso }));
vi.mock('../actions/editar-acceso', () => ({ editarAcceso }));

const ESTACIONES = [{ valor: '3', etiqueta: 'E3 · Trébol' }];
const GUARDIAS = [{ valor: '7', etiqueta: 'Ana Pérez · 1234 56789 0101' }];

async function llenar(usuario: ReturnType<typeof userEvent.setup>, turno: string): Promise<void> {
  await usuario.selectOptions(screen.getByLabelText('Estación'), '3');
  await usuario.type(screen.getByLabelText('Código'), 'C');
  await usuario.selectOptions(screen.getByLabelText('Guardia'), '7');
  await usuario.type(screen.getByLabelText(/Turno/), turno);
  await usuario.click(screen.getByRole('button', { name: 'Registrar acceso' }));
}

describe('FormularioAcceso', () => {
  it('cada campo tiene su etiqueta', () => {
    render(<FormularioAcceso estaciones={ESTACIONES} guardias={GUARDIAS} />);

    for (const etiqueta of ['Estación', 'Código', 'Guardia']) {
      expect(screen.getByLabelText(etiqueta)).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Turno/)).toBeInTheDocument();
  });

  it('un turno mal escrito se marca y se anuncia en el campo, sin enviar', async () => {
    const usuario = userEvent.setup();
    render(<FormularioAcceso estaciones={ESTACIONES} guardias={GUARDIAS} />);

    await llenar(usuario, '6 a 14');

    const turno = screen.getByLabelText(/Turno/);
    expect(turno).toHaveAttribute('aria-invalid', 'true');
    expect(turno).toHaveAccessibleDescription(/Escribe el turno como 06:00-14:00\./);
    expect(registrarAcceso).not.toHaveBeenCalled();
  });

  it('muestra con role="alert" el error que devuelve el backend', async () => {
    const usuario = userEvent.setup();
    registrarAcceso.mockResolvedValue({
      ok: false,
      error: {
        codigo: 'TURNO_TRASLAPADO',
        mensaje: 'El guardia ya tiene el turno 06:00-14:00 en la estación E1.',
        detalles: [],
        estado: 422,
      },
    });
    render(<FormularioAcceso estaciones={ESTACIONES} guardias={GUARDIAS} />);

    await llenar(usuario, '06:00-14:00');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El guardia ya tiene el turno 06:00-14:00 en la estación E1.',
    );
    expect(registrarAcceso).toHaveBeenCalledWith({
      estacionId: 3,
      codigo: 'C',
      nombre: undefined,
      guardiaId: 7,
      turno: '06:00-14:00',
    });
  });

  it('con un acceso existente solo permite cambiar el nombre', async () => {
    const usuario = userEvent.setup();
    editarAcceso.mockResolvedValue({ ok: true });
    render(<FormularioAcceso acceso={{ id: 5, nombre: 'Principal' }} />);

    await usuario.clear(screen.getByLabelText('Nombre del acceso'));
    await usuario.type(screen.getByLabelText('Nombre del acceso'), 'Norte');
    await usuario.click(screen.getByRole('button', { name: 'Guardar nombre' }));

    expect(editarAcceso).toHaveBeenCalledWith(5, { nombre: 'Norte' });
    expect(await screen.findByText('Nombre actualizado.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Código')).not.toBeInTheDocument();
  });
});
