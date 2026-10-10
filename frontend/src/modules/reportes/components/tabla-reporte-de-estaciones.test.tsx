import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FilaDeEstacion } from '../schemas/reportes';
import { TablaReporteDeEstaciones } from './tabla-reporte-de-estaciones';

const ESTACION: FilaDeEstacion = {
  id: 3,
  codigo: 'E003',
  nombre: 'Trébol',
  municipalidad: { id: 1, nombre: 'Guatemala' },
  lineas: [
    { id: 1, codigo: '1', nombre: 'Línea 1' },
    { id: 6, codigo: '6', nombre: 'Línea 6' },
  ],
  tieneParqueo: true,
};

describe('TablaReporteDeEstaciones', () => {
  it('muestra la estación con sus líneas y su parqueo', () => {
    render(
      <TablaReporteDeEstaciones
        estaciones={[
          ESTACION,
          { ...ESTACION, id: 4, codigo: 'E004', lineas: [], tieneParqueo: false },
        ]}
      />,
    );
    const [, primera, segunda] = screen.getAllByRole('row');
    const celdas = within(primera)
      .getAllByRole('cell')
      .map((c) => c.textContent);
    expect(celdas).toEqual(['E003', 'Trébol', 'Guatemala', '1Línea 16Línea 6', 'Sí']);
    expect(within(primera).getByText('6').parentElement?.className).toContain('bg-linea-6');
    expect(within(segunda).getByText('Sin líneas')).toBeInTheDocument();
    expect(within(segunda).getByText('No')).toBeInTheDocument();
  });

  it('sin filas ofrece elegir otros filtros', () => {
    render(<TablaReporteDeEstaciones estaciones={[]} />);
    expect(screen.getByRole('link', { name: 'Elegir otros filtros' })).toHaveAttribute(
      'href',
      '/reportes',
    );
  });
});
