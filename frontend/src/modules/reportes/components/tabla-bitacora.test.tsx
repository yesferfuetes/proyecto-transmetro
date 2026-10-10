import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Constancia } from '../schemas/bitacora';
import { FiltrosBitacora } from './filtros-bitacora';
import { TablaBitacora } from './tabla-bitacora';

const CONSTANCIA: Constancia = {
  id: 1,
  usuario: { id: 2, nombre: 'Ana Supervisora', correo: 'ana@transmetro.test' },
  tipo: 'LINEAS',
  filtros: {
    linea: { id: 12, nombre: 'Línea 12', codigo: '12' },
    municipalidad: { id: 2, nombre: 'Mixco' },
  },
  fechaHora: '2026-10-09T16:30:00.000Z',
};

describe('TablaBitacora', () => {
  it('muestra quién consultó qué, con qué filtros y cuándo', () => {
    render(
      <TablaBitacora
        constancias={[CONSTANCIA, { ...CONSTANCIA, id: 2, filtros: {}, tipo: 'BUSES' }]}
      />,
    );
    const [, primera, segunda] = screen.getAllByRole('row');
    const celdas = within(primera).getAllByRole('cell');
    expect(celdas[0]).toHaveTextContent('09/10/2026');
    expect(celdas[0]).toHaveTextContent('10:30');
    expect(celdas[1]).toHaveTextContent('Ana Supervisora');
    expect(celdas[1]).toHaveTextContent('ana@transmetro.test');
    expect(celdas[2]).toHaveTextContent('Líneas');
    expect(celdas[3]).toHaveTextContent('Línea: Línea 12');
    expect(celdas[3]).toHaveTextContent('Municipalidad: Mixco');
    expect(within(segunda).getByText('Sin filtros')).toBeInTheDocument();
    expect(within(segunda).getByText('Buses por línea')).toBeInTheDocument();
  });

  it('no ofrece editar ni eliminar constancias', () => {
    render(<TablaBitacora constancias={[CONSTANCIA]} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('sin constancias ofrece limpiar los filtros', () => {
    render(<TablaBitacora constancias={[]} />);
    expect(screen.getByRole('link', { name: 'Limpiar filtros' })).toHaveAttribute(
      'href',
      '/reportes/bitacora',
    );
  });
});

describe('FiltrosBitacora', () => {
  it('muestra los filtros elegidos y el total', () => {
    render(
      <FiltrosBitacora
        filtros={{
          usuarioId: 2,
          tipo: 'BUSES',
          desde: '2026-10-01',
          hasta: '2026-10-09',
          pagina: 1,
        }}
        usuarios={[{ id: 2, nombre: 'Ana Supervisora', correo: 'ana@transmetro.test' }]}
        total={3}
      />,
    );
    expect(screen.getByLabelText('Usuario')).toHaveValue('2');
    expect(screen.getByLabelText('Reporte')).toHaveValue('BUSES');
    expect(screen.getByLabelText('Fechas: desde')).toHaveValue('2026-10-01');
    expect(screen.getByLabelText('Fechas: hasta')).toHaveValue('2026-10-09');
    expect(screen.getByText('3 resultados')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Limpiar filtros' })).toBeInTheDocument();
  });
});
