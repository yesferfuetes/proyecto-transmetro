import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarraFiltros } from './barra-filtros';
import { FiltroBusqueda } from './filtro-busqueda';
import { FiltroFechas } from './filtro-fechas';
import { FiltroOpcion } from './filtro-opcion';

describe('BarraFiltros', () => {
  it('es un formulario GET con el total de resultados', () => {
    render(
      <BarraFiltros
        accion="/flota"
        etiqueta="Filtros de flota"
        total={1}
        hayFiltros={false}
        hrefLimpiar="/flota"
      >
        <FiltroBusqueda nombre="q" etiqueta="Buscar por placa" valor="P-1" />
      </BarraFiltros>,
    );

    const formulario = screen.getByRole('form', { name: 'Filtros de flota' });
    expect(formulario).toHaveAttribute('method', 'get');
    expect(formulario).toHaveAttribute('action', '/flota');
    expect(screen.getByText('1 resultado')).toBeVisible();
    expect(screen.getByRole('searchbox', { name: 'Buscar por placa' })).toHaveValue('P-1');
    expect(screen.queryByRole('link', { name: 'Limpiar filtros' })).toBeNull();
  });

  it('ofrece limpiar los filtros solo cuando hay alguno activo', () => {
    render(
      <BarraFiltros accion="/flota" etiqueta="Filtros" total={1234} hayFiltros hrefLimpiar="/flota">
        <FiltroOpcion href="/flota" activo>
          Activos
        </FiltroOpcion>
      </BarraFiltros>,
    );

    expect(screen.getByText('1,234 resultados')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Limpiar filtros' })).toHaveAttribute('href', '/flota');
  });
});

describe('FiltroOpcion', () => {
  it('la opción activa se marca y se realza', () => {
    render(
      <>
        <FiltroOpcion href="?estado=activo" activo>
          Activos
        </FiltroOpcion>
        <FiltroOpcion href="?estado=inactivo" activo={false}>
          Inactivos
        </FiltroOpcion>
      </>,
    );

    expect(screen.getByRole('link', { name: 'Activos' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Activos' })).toHaveClass('bg-primary');
    expect(screen.getByRole('link', { name: 'Inactivos' })).not.toHaveAttribute('aria-current');
  });
});

describe('FiltroFechas', () => {
  it('agrupa desde y hasta con nombres accesibles propios', () => {
    render(
      <FiltroFechas
        etiqueta="Fecha"
        nombreDesde="desde"
        nombreHasta="hasta"
        desde="2026-10-01"
        hasta="2026-10-07"
      />,
    );

    expect(screen.getByRole('group', { name: 'Fecha' })).toBeInTheDocument();
    expect(screen.getByLabelText('Fecha: desde')).toHaveValue('2026-10-01');
    expect(screen.getByLabelText('Fecha: hasta')).toHaveAttribute('name', 'hasta');
  });
});
