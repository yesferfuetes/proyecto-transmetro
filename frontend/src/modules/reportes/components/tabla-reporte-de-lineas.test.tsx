import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FilaDeLinea } from '../schemas/reportes';
import { TablaReporteDeLineas } from './tabla-reporte-de-lineas';

function linea(
  codigo: string,
  buses: number,
  estadoDeFlota: FilaDeLinea['estadoDeFlota'],
  extra: Partial<FilaDeLinea> = {},
): FilaDeLinea {
  return {
    id: Number(codigo) || 5,
    codigo,
    nombre: `Línea ${codigo}`,
    municipalidad: { id: 1, nombre: 'Guatemala' },
    estado: 'ACTIVA',
    estaciones: 3,
    longitudKm: 12.5,
    buses,
    minimo: 3,
    maximo: 6,
    estadoDeFlota,
    ...extra,
  };
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

describe('TablaReporteDeLineas', () => {
  it('rotula el estado de cada flota con texto', () => {
    render(
      <TablaReporteDeLineas
        lineas={[
          linea('1', 7, 'excedida'),
          linea('2', 2, 'insuficiente'),
          linea('6', 4, 'completa'),
        ]}
      />,
    );
    expect(within(fila('Línea 1')).getByText('Excedida')).toBeInTheDocument();
    expect(within(fila('Línea 2')).getByText('Insuficiente')).toBeInTheDocument();
    expect(within(fila('Línea 6')).getByText('Completa')).toBeInTheDocument();
  });

  it('muestra municipalidad, estado, estaciones, longitud, buses, mínimo y máximo', () => {
    render(<TablaReporteDeLineas lineas={[linea('1', 7, 'excedida')]} />);
    const celdas = within(fila('Línea 1'))
      .getAllByRole('cell')
      .map((c) => c.textContent);
    expect(celdas.slice(1, 4)).toEqual(['Guatemala', 'Activa', '3']);
    expect(celdas[4]).toMatch(/^12[.,]500 km$/);
    expect(celdas.slice(5, 8)).toEqual(['7', '3', '6']);
  });

  it('muestra el estado de una línea en construcción y la longitud que falta', () => {
    render(
      <TablaReporteDeLineas
        lineas={[linea('18', 0, 'insuficiente', { estado: 'EN_CONSTRUCCION', longitudKm: null })]}
      />,
    );
    const celdas = within(fila('Línea 18'))
      .getAllByRole('cell')
      .map((c) => c.textContent);
    expect(celdas[2]).toBe('En construcción');
    expect(celdas[4]).toBe('—');
  });

  it('identifica cada línea con la insignia de su color', () => {
    render(
      <TablaReporteDeLineas lineas={[linea('1', 4, 'completa'), linea('12', 4, 'completa')]} />,
    );
    expect(within(fila('Línea 1')).getByText('1').parentElement?.className).toContain('bg-linea-1');
    expect(within(fila('Línea 12')).getByText('12').parentElement?.className).toContain(
      'bg-linea-12',
    );
  });

  it('sin filas avisa que los filtros no dejaron resultados', () => {
    render(<TablaReporteDeLineas lineas={[]} />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
