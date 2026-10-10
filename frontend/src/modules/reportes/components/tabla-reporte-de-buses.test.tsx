import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FilaDeBus } from '../schemas/reportes';
import { filasAgrupadasPorLinea } from './presentacion';
import { TablaReporteDeBuses } from './tabla-reporte-de-buses';

const PARQUEO = { id: 1, codigo: 'P1', estacion: { id: 4, nombre: 'Centra Sur' } };

function bus(
  id: number,
  placa: string,
  codigo: string | null,
  estado: FilaDeBus['estado'] = 'ACTIVO',
): FilaDeBus {
  return {
    id,
    placa,
    capacidadMax: 160,
    estado,
    linea: codigo === null ? null : { id: Number(codigo), codigo, nombre: `Línea ${codigo}` },
    parqueo: PARQUEO,
  };
}

const BUSES = [
  bus(1, 'TM-1', '1'),
  bus(2, 'TM-2', '1'),
  bus(3, 'TM-3', '2', 'MANTENIMIENTO'),
  bus(4, 'TM-4', null, 'BAJA'),
];

function textos(): string[] {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((f) => f.textContent ?? '');
}

describe('TablaReporteDeBuses', () => {
  it('pone una fila de encabezado cada vez que cambia la línea', () => {
    render(<TablaReporteDeBuses buses={BUSES} />);
    const filas = textos();
    expect(filas).toHaveLength(7);
    expect(filas[0]).toContain('Línea 1');
    expect(filas[1]).toContain('TM-1');
    expect(filas[2]).toContain('TM-2');
    expect(filas[3]).toContain('Línea 2');
    expect(filas[4]).toContain('TM-3');
  });

  it('deja al final los buses sin línea', () => {
    render(<TablaReporteDeBuses buses={BUSES} />);
    const filas = textos();
    expect(filas[5]).toContain('Sin línea');
    expect(filas[6]).toContain('TM-4');
  });

  it('muestra capacidad, parqueo y el estado de cada bus con texto', () => {
    render(<TablaReporteDeBuses buses={BUSES} />);
    const filaDelBus = screen.getByText('TM-3').closest('tr');
    expect(filaDelBus).not.toBeNull();
    const celdas = within(filaDelBus as HTMLElement).getAllByRole('cell');
    expect(celdas.map((c) => c.textContent)).toEqual([
      'TM-3',
      '160',
      'En mantenimiento',
      'Centra Sur · P1',
    ]);
    expect(screen.getByText('De baja')).toBeInTheDocument();
  });

  it('repite el encabezado al empezar una página cuando la línea continúa', () => {
    const segundaPagina = filasAgrupadasPorLinea([bus(2, 'TM-2', '1'), bus(3, 'TM-3', '2')]);
    expect(segundaPagina.map((f) => f.tipo)).toEqual(['grupo', 'bus', 'grupo', 'bus']);
    expect(new Set(segundaPagina.map((f) => f.clave)).size).toBe(4);
  });

  it('identifica cada línea con la insignia de su color', () => {
    render(<TablaReporteDeBuses buses={[bus(1, 'TM-1', '12')]} />);
    expect(screen.getByText('12').parentElement?.className).toContain('bg-linea-12');
  });

  it('sin filas avisa que los filtros no dejaron resultados', () => {
    render(<TablaReporteDeBuses buses={[]} />);
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
  });
});
