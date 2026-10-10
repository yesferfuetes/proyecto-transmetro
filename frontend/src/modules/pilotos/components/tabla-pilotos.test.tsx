import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PilotoDeLista, PilotoReducido } from '../schemas/piloto';
import { TablaPilotos } from './tabla-pilotos';

function reducido(
  id: number,
  nombre: string,
  sobrescribir: Partial<PilotoReducido> = {},
): PilotoReducido {
  return {
    id,
    nombre,
    telefono: '5555-1234',
    bus: { id: id + 10, placa: `TM-000${id}`, estado: 'ACTIVO' },
    linea: { id: 1, codigo: '1', nombre: 'Línea 1' },
    busDeBaja: false,
    ...sobrescribir,
  };
}

function completo(piloto: PilotoReducido): PilotoDeLista {
  return { ...piloto, dpi: '1234 56789 0101' };
}

function fila(nombre: string): HTMLElement {
  const encontrada = screen
    .getAllByRole('row')
    .find((f) => within(f).queryAllByText(nombre).length > 0);
  if (encontrada === undefined) {
    throw new Error(`No hay fila de ${nombre}`);
  }
  return encontrada;
}

describe('TablaPilotos', () => {
  it('la vista reducida no tiene columna de DPI', () => {
    render(<TablaPilotos pilotos={[reducido(1, 'Ana')]} vista="reducida" hayFiltros={false} />);
    expect(screen.queryByRole('columnheader', { name: 'DPI' })).not.toBeInTheDocument();
    expect(screen.queryByText('1234 56789 0101')).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Teléfono' })).toBeInTheDocument();
  });

  it('la vista completa agrega el DPI', () => {
    render(
      <TablaPilotos pilotos={[completo(reducido(1, 'Ana'))]} vista="completa" hayFiltros={false} />,
    );
    expect(screen.getByRole('columnheader', { name: 'DPI' })).toBeInTheDocument();
    expect(within(fila('Ana')).getByText('1234 56789 0101')).toBeInTheDocument();
  });

  it('marca con un chip al piloto cuyo bus está de baja', () => {
    render(
      <TablaPilotos
        pilotos={[
          reducido(1, 'Ana', {
            busDeBaja: true,
            bus: { id: 11, placa: 'TM-0001', estado: 'BAJA' },
          }),
          reducido(2, 'Luis'),
        ]}
        vista="reducida"
        hayFiltros={false}
      />,
    );
    expect(within(fila('Ana')).getByText('Bus de baja')).toBeInTheDocument();
    expect(within(fila('Luis')).queryByText('Bus de baja')).not.toBeInTheDocument();
  });

  it('identifica la línea con la insignia de su color y rotula "Sin bus" y "Sin línea"', () => {
    render(
      <TablaPilotos
        pilotos={[
          reducido(1, 'Ana', { linea: { id: 12, codigo: '12', nombre: 'Línea 12' } }),
          reducido(2, 'Luis', { bus: null, linea: null }),
        ]}
        vista="reducida"
        hayFiltros={false}
      />,
    );
    expect(within(fila('Ana')).getByText('12').parentElement?.className).toContain('bg-linea-12');
    expect(within(fila('Luis')).getByText('Sin bus')).toBeInTheDocument();
    expect(within(fila('Luis')).getByText('Sin línea')).toBeInTheDocument();
  });

  it('enlaza cada fila con la ficha del piloto', () => {
    render(<TablaPilotos pilotos={[reducido(5, 'Ana')]} vista="reducida" hayFiltros={false} />);
    expect(screen.getByRole('link', { name: /Abrir\s*piloto Ana/ })).toHaveAttribute(
      'href',
      '/pilotos/5',
    );
  });

  it('sin filas ofrece limpiar los filtros', () => {
    render(<TablaPilotos pilotos={[]} vista="reducida" hayFiltros />);
    expect(screen.getByRole('link', { name: 'Limpiar filtros' })).toHaveAttribute(
      'href',
      '/pilotos',
    );
  });
});
