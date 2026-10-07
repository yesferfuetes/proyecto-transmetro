import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TablaDatos, type Columna } from './tabla-datos';

type Bus = Readonly<{ placa: string; capacidad: number }>;

const BUSES: Bus[] = [
  { placa: 'P-123ABC', capacidad: 160 },
  { placa: 'P-456DEF', capacidad: 90 },
];

const COLUMNAS: Columna<Bus>[] = [
  {
    clave: 'placa',
    encabezado: 'Placa',
    fija: true,
    ordenable: { href: '?orden=placa', orden: 'asc' },
    celda: (bus) => bus.placa,
  },
  { clave: 'capacidad', encabezado: 'Capacidad', alineacion: 'fin', celda: (bus) => bus.capacidad },
];

describe('TablaDatos', () => {
  it('dibuja una tabla con título, encabezados y una fila por dato', () => {
    render(
      <TablaDatos
        id="buses"
        titulo="Buses de la línea 12"
        columnas={COLUMNAS}
        filas={BUSES}
        claveDeFila={(bus) => bus.placa}
        vacio={<p>Sin buses</p>}
      />,
    );

    const tabla = screen.getByRole('table', { name: 'Buses de la línea 12' });
    expect(within(tabla).getAllByRole('row')).toHaveLength(3);
    expect(within(tabla).getByRole('cell', { name: '160' })).toHaveClass('text-right');
    expect(screen.getByRole('region', { name: 'Buses de la línea 12' })).toHaveAttribute(
      'tabindex',
      '0',
    );
  });

  it('marca la columna ordenada y enlaza el cambio de orden', () => {
    render(
      <TablaDatos
        id="buses"
        titulo="Buses"
        columnas={COLUMNAS}
        filas={BUSES}
        claveDeFila={(bus) => bus.placa}
        vacio={null}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Placa' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(screen.getByRole('link', { name: 'Placa' })).toHaveAttribute('href', '?orden=placa');
    expect(screen.getByRole('columnheader', { name: 'Capacidad' })).not.toHaveAttribute(
      'aria-sort',
    );
  });

  it('resalta la fila seleccionada', () => {
    render(
      <TablaDatos
        id="buses"
        titulo="Buses"
        columnas={COLUMNAS}
        filas={BUSES}
        claveDeFila={(bus) => bus.placa}
        seleccionada={(bus) => bus.placa === 'P-456DEF'}
        vacio={null}
      />,
    );

    expect(screen.getByRole('row', { name: /P-456DEF/ })).toHaveClass('bg-primary-soft');
    expect(screen.getByRole('row', { name: /P-123ABC/ })).not.toHaveClass('bg-primary-soft');
  });

  it('sin filas muestra el estado vacío en lugar de la tabla', () => {
    render(
      <TablaDatos
        id="buses"
        titulo="Buses"
        columnas={COLUMNAS}
        filas={[]}
        claveDeFila={(bus) => bus.placa}
        vacio={<p>Sin buses</p>}
      />,
    );

    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText('Sin buses')).toBeVisible();
  });
});
