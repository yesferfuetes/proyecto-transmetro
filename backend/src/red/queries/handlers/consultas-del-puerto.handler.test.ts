import { In, Repository } from 'typeorm';
import type { Estacion } from '../../entities/estacion.entity';
import type { LineaEstacion } from '../../entities/linea-estacion.entity';
import type { Linea } from '../../entities/linea.entity';
import type { Municipalidad } from '../../entities/municipalidad.entity';
import { ListarEstacionesDeLinea } from '../impl/listar-estaciones-de-linea.query';
import { ObtenerEstacionesResumen } from '../impl/obtener-estaciones-resumen.query';
import { ObtenerLineasResumen } from '../impl/obtener-lineas-resumen.query';
import { ObtenerMunicipalidad } from '../impl/obtener-municipalidad.query';
import { ListarEstacionesDeLineaHandler } from './listar-estaciones-de-linea.handler';
import { ListarOpcionesDeEstacionHandler } from './listar-opciones-de-estacion.handler';
import { ObtenerEstacionesResumenHandler } from './obtener-estaciones-resumen.handler';
import { ObtenerLineasResumenHandler } from './obtener-lineas-resumen.handler';
import { ObtenerMunicipalidadHandler } from './obtener-municipalidad.handler';

const E1 = {
  id: 1,
  codigo: 'E1',
  nombre: 'Uno',
  municipalidadId: 1,
  tieneParqueo: true,
  latitud: null,
  longitud: null,
} as Estacion;
const RESUMEN_E1 = { id: 1, codigo: 'E1', nombre: 'Uno', municipalidadId: 1, tieneParqueo: true };

function repositorio<E extends object>(metodos: Record<string, jest.Mock>): Repository<E> {
  return metodos as unknown as Repository<E>;
}

describe('consultas de resumen y opciones', () => {
  it('ObtenerEstacionesResumen filtra por ids y no expone coordenadas', async () => {
    const find = jest.fn().mockResolvedValue([E1]);
    const handler = new ObtenerEstacionesResumenHandler(repositorio({ find }));

    await expect(handler.execute(new ObtenerEstacionesResumen([1, 99]))).resolves.toEqual([
      RESUMEN_E1,
    ]);
    expect(find).toHaveBeenCalledWith({ where: { id: In([1, 99]) }, order: { codigo: 'ASC' } });
  });

  it('ObtenerEstacionesResumen sin ids devuelve todas y con lista vacía no consulta', async () => {
    const find = jest.fn().mockResolvedValue([E1]);
    const handler = new ObtenerEstacionesResumenHandler(repositorio({ find }));

    await expect(handler.execute(new ObtenerEstacionesResumen())).resolves.toEqual([RESUMEN_E1]);
    expect(find).toHaveBeenCalledWith({ where: {}, order: { codigo: 'ASC' } });
    await expect(handler.execute(new ObtenerEstacionesResumen([]))).resolves.toEqual([]);
    expect(find).toHaveBeenCalledTimes(1);
  });

  it('ObtenerLineasResumen convierte el número de estaciones y no consulta sin ids', async () => {
    const llamadas: unknown[][] = [];
    const constructor: object = new Proxy(
      {},
      {
        get: (_objetivo, metodo: string) =>
          metodo === 'getRawMany'
            ? () =>
                Promise.resolve([
                  {
                    id: 1,
                    codigo: 'L1',
                    nombre: 'Centro',
                    estado: 'ACTIVA',
                    numeroDeEstaciones: '10',
                  },
                ])
            : (...argumentos: unknown[]) => {
                llamadas.push([metodo, ...argumentos]);
                return constructor;
              },
      },
    );
    const createQueryBuilder = jest.fn(() => constructor);
    const handler = new ObtenerLineasResumenHandler(repositorio<Linea>({ createQueryBuilder }));

    await expect(handler.execute(new ObtenerLineasResumen([1]))).resolves.toEqual([
      { id: 1, codigo: 'L1', nombre: 'Centro', estado: 'ACTIVA', numeroDeEstaciones: 10 },
    ]);
    expect(llamadas).toContainEqual(['where', 'l.id IN (:...ids)', { ids: [1] }]);
    await expect(handler.execute(new ObtenerLineasResumen([]))).resolves.toEqual([]);
    expect(createQueryBuilder).toHaveBeenCalledTimes(1);
  });

  it('ObtenerLineasResumen sin ids devuelve todas ordenadas por código', async () => {
    const llamadas: unknown[][] = [];
    const constructor: object = new Proxy(
      {},
      {
        get: (_objetivo, metodo: string) =>
          metodo === 'getRawMany'
            ? () => Promise.resolve([])
            : (...argumentos: unknown[]) => {
                llamadas.push([metodo, ...argumentos]);
                return constructor;
              },
      },
    );
    const handler = new ObtenerLineasResumenHandler(
      repositorio<Linea>({ createQueryBuilder: jest.fn(() => constructor) }),
    );

    await expect(handler.execute(new ObtenerLineasResumen())).resolves.toEqual([]);
    expect(llamadas).toContainEqual(['orderBy', 'l.codigo', 'ASC']);
    expect(llamadas.some(([metodo]) => metodo === 'where')).toBe(false);
  });

  it('ListarEstacionesDeLinea devuelve las estaciones en el orden del recorrido', async () => {
    const E2: Estacion = { ...E1, id: 2, codigo: 'E2' };
    const find = jest.fn().mockResolvedValue([{ estacion: E2 }, { estacion: E1 }]);
    const handler = new ListarEstacionesDeLineaHandler(repositorio<LineaEstacion>({ find }));

    const estaciones = await handler.execute(new ListarEstacionesDeLinea(3));

    expect(estaciones.map((estacion) => estacion.codigo)).toEqual(['E2', 'E1']);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { lineaId: 3 }, order: { ordenSecuencia: 'ASC' } }),
    );
  });

  it('ListarOpcionesDeEstacion devuelve solo id, código y nombre', async () => {
    const find = jest.fn().mockResolvedValue([E1]);
    const handler = new ListarOpcionesDeEstacionHandler(repositorio({ find }));

    await expect(handler.execute()).resolves.toEqual([{ id: 1, codigo: 'E1', nombre: 'Uno' }]);
  });

  it('ObtenerMunicipalidad devuelve sus datos o null', async () => {
    const mixco = { id: 2, nombre: 'Mixco', departamento: null, fechaIncorporacion: '2026-01-15' };
    const findOneBy = jest.fn().mockResolvedValueOnce(mixco).mockResolvedValueOnce(null);
    const handler = new ObtenerMunicipalidadHandler(repositorio<Municipalidad>({ findOneBy }));

    await expect(handler.execute(new ObtenerMunicipalidad(2))).resolves.toEqual(mixco);
    await expect(handler.execute(new ObtenerMunicipalidad(99))).resolves.toBeNull();
  });
});
