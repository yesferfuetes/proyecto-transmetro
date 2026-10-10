import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { editarPiloto } from '../actions/editar-piloto';
import { registrarPiloto } from '../actions/registrar-piloto';
import { FormularioPiloto } from './formulario-piloto';

vi.mock('../actions/registrar-piloto', () => ({ registrarPiloto: vi.fn() }));
vi.mock('../actions/editar-piloto', () => ({ editarPiloto: vi.fn() }));

const BUSES = [{ valor: '4', etiqueta: 'TM-0004 · línea 1 (1 piloto)' }];

const PILOTO = {
  id: 7,
  nombre: 'Ana López',
  dpi: '1234 56789 0101',
  direccionResidencia: 'Zona 1',
  telefono: '5555-1234',
  correo: null,
  historialEducativo: 'Bachiller',
};

describe('FormularioPiloto', () => {
  beforeEach(() => {
    vi.mocked(registrarPiloto).mockReset();
    vi.mocked(editarPiloto).mockReset();
  });

  it('al registrar tiene una etiqueta por campo y ofrece el bus', () => {
    render(<FormularioPiloto buses={BUSES} />);
    for (const etiqueta of [
      'Nombre',
      'DPI',
      'Teléfono',
      'Correo (opcional)',
      'Dirección de residencia',
      'Historial educativo',
      'Bus (opcional)',
    ]) {
      expect(screen.getByLabelText(etiqueta)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Registrar piloto' })).toBeInTheDocument();
  });

  it('al editar no ofrece el bus y parte del expediente', () => {
    render(<FormularioPiloto buses={[]} piloto={PILOTO} />);
    expect(screen.queryByLabelText('Bus (opcional)')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana López');
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
  });

  it('marca cada campo faltante o inválido sin llamar a la acción', async () => {
    render(<FormularioPiloto buses={BUSES} />);
    await userEvent.type(screen.getByLabelText('DPI'), '123456789012');
    await userEvent.type(screen.getByLabelText('Teléfono'), '5555123');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar piloto' }));
    expect(await screen.findByText('Escribe el nombre.')).toBeInTheDocument();
    expect(screen.getByText('El DPI tiene 13 dígitos.', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('El teléfono tiene 8 dígitos.', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Escribe la dirección de residencia.')).toBeInTheDocument();
    expect(screen.getByText('Escribe el historial educativo.')).toBeInTheDocument();
    expect(registrarPiloto).not.toHaveBeenCalled();
  });

  it('muestra el error del backend tal cual', async () => {
    vi.mocked(editarPiloto).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'DPI_PILOTO_DUPLICADO',
        mensaje: 'Ese DPI ya está registrado.',
        detalles: [],
        estado: 409,
      },
    });
    render(<FormularioPiloto buses={[]} piloto={PILOTO} />);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ese DPI ya está registrado.');
    expect(editarPiloto).toHaveBeenCalledWith(7, expect.objectContaining({ nombre: 'Ana López' }));
  });
});
