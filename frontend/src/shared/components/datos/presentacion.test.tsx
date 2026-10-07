import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChipEstado } from './chip-estado';
import { Cifra } from './cifra';
import { Esqueleto } from './esqueleto';
import { EstadoVacio } from './estado-vacio';
import { PuntoLinea } from './punto-linea';

describe('Cifra', () => {
  it('pone la etiqueta encima del número, con formato local', () => {
    render(<Cifra etiqueta="Buses en servicio" valor={1234} unidad="buses" />);

    const termino = screen.getByRole('term');
    expect(termino).toHaveTextContent('Buses en servicio');
    expect(screen.getByText('1,234')).toBeVisible();
    expect(screen.getByText('buses')).toBeVisible();
  });

  it('el estado acompaña a la cifra sin cambiarle el color', () => {
    render(
      <Cifra
        etiqueta="Alertas"
        valor={0}
        tono="oscuro"
        tamano="tarjeta"
        estado={<ChipEstado estado="exito">Sin alertas</ChipEstado>}
      />,
    );

    expect(screen.getByText('0')).toHaveClass('text-figure-sm');
    expect(screen.getByText('0').parentElement).toHaveClass('text-ink-inverse');
    expect(screen.getByText('Sin alertas')).toBeVisible();
  });
});

describe('ChipEstado', () => {
  it('lleva siempre ícono y texto', () => {
    const { container } = render(
      <ChipEstado estado="advertencia" tono="oscuro">
        Baja ocupación
      </ChipEstado>,
    );

    expect(screen.getByText('Baja ocupación')).toHaveClass('text-warning-on-night');
    expect(container.querySelector('svg')).not.toBeNull();
  });
});

describe('EstadoVacio', () => {
  it('sin datos muestra título, texto y acción', () => {
    render(
      <EstadoVacio
        variante="sin-datos"
        titulo="Sin buses"
        texto="Registra el primero."
        accion={<button type="button">Registrar</button>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Sin buses' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Registrar' })).toBeVisible();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('el error de carga se anuncia como alerta', () => {
    render(<EstadoVacio variante="error-de-carga" titulo="No se pudo cargar" texto="Reintenta." />);

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar');
  });
});

describe('Esqueleto', () => {
  it('anuncia una sola vez que está cargando y dibuja los bloques pedidos', () => {
    const { container } = render(<Esqueleto forma="fila" cantidad={3} />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3);
  });
});

describe('PuntoLinea', () => {
  it('acompaña el punto de color con el nombre de la línea', () => {
    render(<PuntoLinea codigo="18" />);

    expect(screen.getByText('Línea 18')).toBeVisible();
  });

  it('acepta un nombre propio', () => {
    render(<PuntoLinea codigo="R5" nombre="Ruta 5 · Hipódromo" tono="oscuro" />);

    expect(screen.getByText('Ruta 5 · Hipódromo')).toBeVisible();
  });
});
