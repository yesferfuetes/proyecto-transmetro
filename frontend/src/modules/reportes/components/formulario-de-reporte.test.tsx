import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generarReporte } from '../actions/generar-reporte';
import { FormularioDeReporte } from './formulario-de-reporte';

vi.mock('../actions/generar-reporte', () => ({ generarReporte: vi.fn() }));

const OPCIONES = {
  lineas: [{ valor: '1', etiqueta: '1 · Línea 1' }],
  estaciones: [{ valor: '3', etiqueta: 'E003 · Trébol' }],
  municipalidades: [{ valor: '2', etiqueta: 'Mixco' }],
};

describe('FormularioDeReporte', () => {
  beforeEach(() => {
    vi.mocked(generarReporte).mockReset();
  });

  it('muestra el rango de fechas desactivado con su aviso', () => {
    render(<FormularioDeReporte opciones={OPCIONES} />);
    expect(screen.getByLabelText('Rango de fechas: desde')).toBeDisabled();
    expect(screen.getByLabelText('Rango de fechas: hasta')).toBeDisabled();
    expect(screen.getByText('El reporte refleja el estado actual.')).toBeInTheDocument();
  });

  it('pide elegir el tipo y no llama a la acción sin él', async () => {
    render(<FormularioDeReporte opciones={OPCIONES} />);
    await userEvent.click(screen.getByRole('button', { name: 'Generar reporte' }));
    expect(await screen.findByText('Elige un tipo de reporte.')).toBeInTheDocument();
    expect(generarReporte).not.toHaveBeenCalled();
  });

  it('envía el tipo y los filtros elegidos', async () => {
    vi.mocked(generarReporte).mockResolvedValue({ ok: true });
    render(<FormularioDeReporte opciones={OPCIONES} />);
    await userEvent.selectOptions(screen.getByLabelText('Tipo de reporte'), 'BUSES');
    await userEvent.selectOptions(screen.getByLabelText(/^Línea/), '1');
    await userEvent.click(screen.getByRole('button', { name: 'Generar reporte' }));
    await vi.waitFor(() => expect(generarReporte).toHaveBeenCalledTimes(1));
    expect(vi.mocked(generarReporte).mock.calls[0]?.[0]).toMatchObject({
      tipo: 'BUSES',
      lineaId: 1,
    });
  });

  it('muestra el error del backend tal cual', async () => {
    vi.mocked(generarReporte).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'LINEA_NO_EXISTE',
        mensaje: 'La línea elegida no existe.',
        detalles: [],
        estado: 422,
      },
    });
    render(<FormularioDeReporte opciones={OPCIONES} />);
    await userEvent.selectOptions(screen.getByLabelText('Tipo de reporte'), 'LINEAS');
    await userEvent.click(screen.getByRole('button', { name: 'Generar reporte' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('La línea elegida no existe.');
  });
});
