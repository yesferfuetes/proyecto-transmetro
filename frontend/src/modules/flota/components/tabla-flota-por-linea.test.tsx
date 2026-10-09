import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FlotaDeLinea } from '../schemas/flota-por-linea';
import { TablaFlotaPorLinea } from './tabla-flota-por-linea';

function flota(
  codigo: string,
  buses: number,
  estadoDeFlota: FlotaDeLinea['estadoDeFlota'],
): FlotaDeLinea {
  return {
    linea: { id: Number(codigo), codigo, nombre: `Línea ${codigo}`, estado: 'ACTIVA' },
    estaciones: 3,
    minimo: 3,
    maximo: 6,
    buses,
    estadoDeFlota,
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

describe('TablaFlotaPorLinea', () => {
  it('rotula el estado de cada flota con texto', () => {
    render(
      <TablaFlotaPorLinea
        lineas={[
          flota('1', 7, 'excedida'),
          flota('2', 2, 'insuficiente'),
          flota('6', 4, 'completa'),
        ]}
      />,
    );
    expect(within(fila('Línea 1')).getByText('Excedida')).toBeInTheDocument();
    expect(within(fila('Línea 2')).getByText('Insuficiente')).toBeInTheDocument();
    expect(within(fila('Línea 6')).getByText('Completa')).toBeInTheDocument();
  });

  it('muestra mínimo, máximo y buses de la línea', () => {
    render(<TablaFlotaPorLinea lineas={[flota('1', 7, 'excedida')]} />);
    const celdas = within(fila('Línea 1'))
      .getAllByRole('cell')
      .map((c) => c.textContent);
    expect(celdas.slice(1, 5)).toEqual(['3', '3', '6', '7']);
  });

  it('identifica cada línea con la insignia de su color', () => {
    render(<TablaFlotaPorLinea lineas={[flota('1', 4, 'completa'), flota('12', 4, 'completa')]} />);
    expect(within(fila('Línea 1')).getByText('1').parentElement?.className).toContain('bg-linea-1');
    expect(within(fila('Línea 12')).getByText('12').parentElement?.className).toContain(
      'bg-linea-12',
    );
  });

  it('enlaza a los buses filtrados por esa línea', () => {
    render(<TablaFlotaPorLinea lineas={[flota('1', 4, 'completa')]} />);
    expect(screen.getByRole('link', { name: /Ver buses/ })).toHaveAttribute(
      'href',
      '/flota?lineaId=1',
    );
  });
});
