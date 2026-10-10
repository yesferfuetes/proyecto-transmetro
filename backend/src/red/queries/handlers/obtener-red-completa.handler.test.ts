import type { Repository } from 'typeorm';
import type { Estacion } from '../../entities/estacion.entity';
import type { LineaEstacion } from '../../entities/linea-estacion.entity';
import type { Linea } from '../../entities/linea.entity';
import type { Municipalidad } from '../../entities/municipalidad.entity';
import { ObtenerRedCompletaHandler } from './obtener-red-completa.handler';

function repositorio<E extends object>(filas: unknown[]): { repo: Repository<E>; find: jest.Mock } {
  const find = jest.fn().mockResolvedValue(filas);
  return { repo: { find } as unknown as Repository<E>, find };
}

function estacion(id: number, tieneParqueo: boolean): Estacion {
  return {
    id,
    codigo: `E${id}`,
    nombre: `Estación ${id}`,
    municipalidadId: 1,
    tieneParqueo,
    latitud: 14.6,
    longitud: -90.5,
  };
}

describe('ObtenerRedCompletaHandler', () => {
  const guatemala = { id: 1, nombre: 'Guatemala', departamento: 'Guatemala' } as Municipalidad;
  const centro = {
    id: 5,
    codigo: 'L1',
    nombre: 'Centro',
    municipalidadId: 1,
    longitudKm: 3.5,
    estado: 'ACTIVA',
  } as Linea;
  const vacia = {
    id: 6,
    codigo: 'L2',
    nombre: 'Nueva',
    municipalidadId: 1,
    longitudKm: null,
    estado: 'EN_CONSTRUCCION',
  } as Linea;

  function preparar(): ObtenerRedCompletaHandler {
    return new ObtenerRedCompletaHandler(
      repositorio<Municipalidad>([guatemala]).repo,
      repositorio<Linea>([centro, vacia]).repo,
      repositorio<Estacion>([estacion(1, true), estacion(2, false), estacion(3, false)]).repo,
      repositorio<LineaEstacion>([
        { lineaId: 5, estacionId: 3, ordenSecuencia: 1 },
        { lineaId: 5, estacionId: 1, ordenSecuencia: 2 },
      ]).repo,
    );
  }

  it('trae municipalidades, líneas con su recorrido en orden y estaciones sin coordenadas', async () => {
    const red = await preparar().execute();

    expect(red.municipalidades).toEqual([{ id: 1, nombre: 'Guatemala' }]);
    expect(red.lineas).toEqual([
      {
        id: 5,
        codigo: 'L1',
        nombre: 'Centro',
        estado: 'ACTIVA',
        numeroDeEstaciones: 2,
        municipalidadId: 1,
        longitudKm: 3.5,
        estacionIds: [3, 1],
      },
      expect.objectContaining({
        id: 6,
        estado: 'EN_CONSTRUCCION',
        numeroDeEstaciones: 0,
        longitudKm: null,
        estacionIds: [],
      }),
    ]);
    expect(red.estaciones).toHaveLength(3);
    expect(red.estaciones[0]).toEqual({
      id: 1,
      codigo: 'E1',
      nombre: 'Estación 1',
      municipalidadId: 1,
      tieneParqueo: true,
    });
  });

  it('pide el recorrido ordenado por línea y por posición', async () => {
    const recorridos = repositorio<LineaEstacion>([]);
    const handler = new ObtenerRedCompletaHandler(
      repositorio<Municipalidad>([]).repo,
      repositorio<Linea>([]).repo,
      repositorio<Estacion>([]).repo,
      recorridos.repo,
    );

    await expect(handler.execute()).resolves.toEqual({
      municipalidades: [],
      lineas: [],
      estaciones: [],
    });
    expect(recorridos.find).toHaveBeenCalledWith({
      order: { lineaId: 'ASC', ordenSecuencia: 'ASC' },
    });
  });
});
