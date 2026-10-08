import { describe, expect, it } from 'vitest';
import { esquemaFiltrosUsuarios } from './usuario';

describe('filtros del listado de usuarios', () => {
  it('lee los filtros válidos de la URL', () => {
    expect(
      esquemaFiltrosUsuarios.parse({
        rol: 'ADMINISTRADOR',
        estacionId: '3',
        activo: 'false',
        busqueda: ' ana ',
        pagina: '2',
      }),
    ).toEqual({ rol: 'ADMINISTRADOR', estacionId: 3, activo: 'false', busqueda: 'ana', pagina: 2 });
  });

  it('ignora lo que no entiende y empieza en la página 1', () => {
    expect(
      esquemaFiltrosUsuarios.parse({
        rol: 'PASAJERO',
        estacionId: 'x',
        activo: 'si',
        pagina: '-1',
      }),
    ).toEqual({ pagina: 1 });
  });

  it('con un parámetro repetido usa el primero', () => {
    expect(esquemaFiltrosUsuarios.parse({ rol: ['ADMINISTRADOR', 'OPERADOR_ESTACION'] })).toEqual({
      rol: 'ADMINISTRADOR',
      pagina: 1,
    });
  });
});
