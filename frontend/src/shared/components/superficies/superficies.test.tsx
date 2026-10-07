import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EncabezadoPagina } from './encabezado-pagina';
import { FranjaSuperior } from './franja-superior';
import { Seccion } from './seccion';
import { Tarjeta } from './tarjeta';
import { TituloDosTonos } from './titulo-dos-tonos';

describe('TituloDosTonos', () => {
  it('sobre claro destaca la palabra en azul', () => {
    render(<TituloDosTonos nivel={1} destacado="Flota" resto="de buses" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Flota de buses' })).toHaveClass(
      'text-ink',
    );
    expect(screen.getByText('Flota')).toHaveClass('text-primary');
  });

  it('sobre oscuro destaca en verde y respeta el orden pedido', () => {
    render(
      <TituloDosTonos
        nivel={2}
        destacado="activas"
        resto="Alertas"
        orden="destacado-ultimo"
        tono="oscuro"
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Alertas activas' })).toHaveClass(
      'text-ink-inverse',
    );
    expect(screen.getByText('activas')).toHaveClass('text-accent');
  });
});

describe('Seccion', () => {
  it('toma su título como nombre accesible', () => {
    render(
      <Seccion id="flota" destacado="Flota" resto="por línea" acciones={<a href="/flota">Ver</a>}>
        <p>Contenido</p>
      </Seccion>,
    );

    expect(screen.getByRole('region', { name: 'Flota por línea' })).toHaveTextContent('Contenido');
    expect(screen.getByRole('link', { name: 'Ver' })).toBeVisible();
  });
});

describe('EncabezadoPagina', () => {
  it('lleva el título de la página, la descripción y las acciones', () => {
    render(
      <EncabezadoPagina
        destacado="Flota"
        resto="de buses"
        descripcion="Buses registrados por línea."
        acciones={<button type="button">Registrar bus</button>}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Flota de buses' })).toBeVisible();
    expect(screen.getByText('Buses registrados por línea.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Registrar bus' })).toBeVisible();
  });
});

describe('Tarjeta y FranjaSuperior', () => {
  it('la tarjeta de una línea lleva el borde de su color', () => {
    render(
      <Tarjeta linea="12" como="article">
        Línea 12
      </Tarjeta>,
    );

    expect(screen.getByRole('article')).toHaveClass('border-l-4', 'border-l-linea-12');
  });

  it('la tarjeta oscura usa la superficie oscura', () => {
    render(<Tarjeta variante="oscura">Dato</Tarjeta>);

    expect(screen.getByText('Dato')).toHaveClass('bg-night-raised', 'text-ink-inverse');
  });

  it('la franja es una región con nombre sobre la superficie oscura', () => {
    render(
      <FranjaSuperior etiqueta="Resumen" variante="compacta">
        <p>12</p>
      </FranjaSuperior>,
    );

    expect(screen.getByRole('region', { name: 'Resumen' })).toHaveClass('bg-night');
  });
});
