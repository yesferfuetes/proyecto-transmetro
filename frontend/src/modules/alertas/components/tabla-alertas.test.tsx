import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Alerta } from '../schemas/alerta';
import { TablaAlertas } from './tabla-alertas';

vi.mock('../actions/atender-alerta', () => ({ atenderAlerta: vi.fn() }));

function alerta(id: number, cambios: Partial<Alerta> = {}): Alerta {
  return {
    id,
    tipo: 'SOBRECUPO',
    aviso: 'Hace falta otra unidad en esta estación.',
    porcentaje: 150,
    fechaHora: '2026-10-09T15:00:00.000Z',
    atendida: false,
    estacion: { id: 3, codigo: 'E3', nombre: 'Trébol' },
    bus: { id: 7, placa: `TM-000${id}` },
    linea: { id: 2, codigo: '12', nombre: 'Línea 12' },
    atendidaPor: null,
    ...cambios,
  };
}

const BAJA = alerta(2, {
  tipo: 'BAJA_OCUPACION',
  aviso: 'Debe esperar 5 minutos adicionales en esta estación.',
  porcentaje: 24.5,
});

function fila(texto: string): HTMLElement {
  const encontrada = screen
    .getAllByRole('row')
    .find((f) => within(f).queryAllByText(texto).length > 0);
  if (encontrada === undefined) {
    throw new Error(`No hay fila con ${texto}`);
  }
  return encontrada;
}

function dibujar(cambios: Partial<Parameters<typeof TablaAlertas>[0]> = {}): void {
  render(
    <TablaAlertas
      alertas={[alerta(1), BAJA]}
      mostrarEstacion
      puedeAtender={false}
      hayFiltros={false}
      {...cambios}
    />,
  );
}

describe('TablaAlertas', () => {
  it('rotula el tipo con texto y muestra el aviso de cada tipo', () => {
    dibujar();
    expect(within(fila('TM-0001')).getByText('Sobrecupo')).toBeInTheDocument();
    expect(
      within(fila('TM-0001')).getByText('Hace falta otra unidad en esta estación.'),
    ).toBeVisible();
    expect(within(fila('TM-0002')).getByText('Baja ocupación')).toBeInTheDocument();
    expect(
      within(fila('TM-0002')).getByText('Debe esperar 5 minutos adicionales en esta estación.'),
    ).toBeVisible();
    expect(within(fila('TM-0002')).getByText(/^24[.,]5 %$/)).toBeInTheDocument();
  });

  it('muestra la línea con la insignia de su color', () => {
    dibujar();
    const insignia = within(fila('TM-0001')).getByText('Línea 12', { selector: '.sr-only' });
    expect(insignia.parentElement).toHaveClass('bg-linea-12');
  });

  it('muestra la columna de estación solo si se pide', () => {
    dibujar();
    expect(screen.getByRole('columnheader', { name: 'Estación' })).toBeInTheDocument();
    expect(within(fila('TM-0001')).getByText('Trébol')).toBeInTheDocument();
  });

  it('el operador no ve la columna de estación', () => {
    dibujar({ mostrarEstacion: false });
    expect(screen.queryByRole('columnheader', { name: 'Estación' })).not.toBeInTheDocument();
  });

  it('resalta la alerta indicada', () => {
    dibujar({ resaltada: 2 });
    expect(fila('TM-0002')).toHaveClass('bg-primary-soft');
    expect(fila('TM-0001')).not.toHaveClass('bg-primary-soft');
  });

  it('solo las pendientes tienen botón de atender, y solo para quien atiende', () => {
    dibujar({
      puedeAtender: true,
      alertas: [
        alerta(1),
        alerta(3, { atendida: true, atendidaPor: { id: 9, nombre: 'Ana Pérez' } }),
      ],
    });
    expect(within(fila('TM-0001')).getByRole('button', { name: /Atender/ })).toBeInTheDocument();
    expect(within(fila('TM-0003')).queryByRole('button')).not.toBeInTheDocument();
    expect(within(fila('TM-0003')).getByText('por Ana Pérez')).toBeInTheDocument();
  });

  it('sin permiso de atender no hay columna de acciones', () => {
    dibujar();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Acciones' })).not.toBeInTheDocument();
  });

  it('sin alertas explica que aún no hay, o que los filtros no coinciden', () => {
    dibujar({ alertas: [] });
    expect(screen.getByText('Aún no hay alertas')).toBeInTheDocument();
  });

  it('sin resultados por los filtros ofrece limpiarlos', () => {
    dibujar({ alertas: [], hayFiltros: true });
    expect(screen.getByRole('link', { name: 'Limpiar filtros' })).toHaveAttribute(
      'href',
      '/alertas',
    );
  });
});
