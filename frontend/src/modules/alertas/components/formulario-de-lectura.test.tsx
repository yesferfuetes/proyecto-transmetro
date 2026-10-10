import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registrarDemanda } from '../actions/registrar-demanda';
import { registrarOcupacion } from '../actions/registrar-ocupacion';
import { FormularioDeLectura } from './formulario-de-lectura';

vi.mock('../actions/registrar-demanda', () => ({ registrarDemanda: vi.fn() }));
vi.mock('../actions/registrar-ocupacion', () => ({ registrarOcupacion: vi.fn() }));

const BUSES = [
  {
    id: 7,
    placa: 'TM-0007',
    capacidadMax: 100,
    linea: { id: 2, codigo: '12', nombre: 'Línea 12' },
  },
];

async function registrar(pasajeros: string, boton: string): Promise<void> {
  await userEvent.selectOptions(screen.getByLabelText('Bus'), '7');
  await userEvent.type(screen.getByLabelText(/^Pasajeros/), pasajeros);
  await userEvent.click(screen.getByRole('button', { name: boton }));
}

describe('FormularioDeLectura', () => {
  beforeEach(() => {
    vi.mocked(registrarDemanda).mockReset();
    vi.mocked(registrarOcupacion).mockReset();
  });

  it('muestra "No corresponde alerta" cuando no nace una alerta', async () => {
    vi.mocked(registrarDemanda).mockResolvedValue({ ok: true, alertaId: null });
    render(<FormularioDeLectura tipo="demanda" buses={BUSES} />);
    await registrar('10', 'Registrar demanda');
    expect(await screen.findByText('No corresponde alerta')).toBeInTheDocument();
    expect(registrarDemanda).toHaveBeenCalledWith({ busId: 7, pasajeros: 10 });
  });

  it('usa la acción de ocupación en el formulario de ocupación', async () => {
    vi.mocked(registrarOcupacion).mockResolvedValue({ ok: true, alertaId: null });
    render(<FormularioDeLectura tipo="ocupacion" buses={BUSES} />);
    await registrar('60', 'Registrar ocupación');
    expect(await screen.findByText('No corresponde alerta')).toBeInTheDocument();
    expect(registrarOcupacion).toHaveBeenCalledWith({ busId: 7, pasajeros: 60 });
    expect(registrarDemanda).not.toHaveBeenCalled();
  });

  it('muestra el error del backend tal cual', async () => {
    vi.mocked(registrarOcupacion).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'PASAJEROS_EXCEDEN_CAPACIDAD',
        mensaje: 'Los pasajeros a bordo superan la capacidad del bus.',
        detalles: [],
        estado: 422,
      },
    });
    render(<FormularioDeLectura tipo="ocupacion" buses={BUSES} />);
    await registrar('101', 'Registrar ocupación');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Los pasajeros a bordo superan la capacidad del bus.',
    );
  });

  it('muestra la alerta repetida como aviso informativo, no como falla', async () => {
    vi.mocked(registrarDemanda).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'ALERTA_PENDIENTE_EXISTENTE',
        mensaje: 'Ya hay una alerta pendiente para este bus en tu estación.',
        detalles: [],
        estado: 409,
      },
    });
    render(<FormularioDeLectura tipo="demanda" buses={BUSES} />);
    await registrar('150', 'Registrar demanda');
    const aviso = await screen.findByRole('status');
    expect(aviso).toHaveTextContent('Ya hay una alerta pendiente para este bus en tu estación.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('no envía una cifra vacía y la señala en el campo', async () => {
    render(<FormularioDeLectura tipo="demanda" buses={BUSES} />);
    await userEvent.selectOptions(screen.getByLabelText('Bus'), '7');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar demanda' }));
    expect(
      await screen.findByText('Escribe los pasajeros como un número entero desde 0.'),
    ).toBeInTheDocument();
    expect(registrarDemanda).not.toHaveBeenCalled();
  });

  it('al elegir un bus muestra su línea con la insignia de color', async () => {
    render(<FormularioDeLectura tipo="demanda" buses={BUSES} />);
    await userEvent.selectOptions(screen.getByLabelText('Bus'), '7');
    const insignia = screen.getByText('Línea 12', { selector: '.sr-only' });
    expect(insignia.parentElement).toHaveClass('bg-linea-12');
  });
});
