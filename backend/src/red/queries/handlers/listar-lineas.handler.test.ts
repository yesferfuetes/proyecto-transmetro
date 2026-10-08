import type { Repository } from 'typeorm';
import type { Linea } from '../../entities/linea.entity';
import { ListarLineas } from '../impl/listar-lineas.query';
import { ListarLineasHandler } from './listar-lineas.handler';

type Llamada = [string, unknown[]];

/** Constructor de consultas que registra cada llamada y devuelve los resultados dados. */
function constructorSimulado(
  filas: unknown[],
  total: number,
): { repositorio: Repository<Linea>; llamadas: Llamada[] } {
  const llamadas: Llamada[] = [];
  const constructor: object = new Proxy(
    {},
    {
      get: (_objetivo, metodo: string) => {
        if (metodo === 'getRawMany') return () => Promise.resolve(filas);
        if (metodo === 'getCount') return () => Promise.resolve(total);
        return (...argumentos: unknown[]) => {
          llamadas.push([metodo, argumentos]);
          return constructor;
        };
      },
    },
  );
  const repositorio = { createQueryBuilder: jest.fn(() => constructor) };
  return { repositorio: repositorio as unknown as Repository<Linea>, llamadas };
}

const FILA = {
  id: 1,
  codigo: 'L1',
  nombre: 'Centro',
  municipalidadId: 1,
  municipalidadNombre: 'Guatemala',
  estado: 'ACTIVA',
  numeroDeEstaciones: '10',
  longitudKm: '7.616',
};

describe('ListarLineasHandler', () => {
  it('convierte los conteos y la longitud a números y devuelve la página', async () => {
    const { repositorio } = constructorSimulado(
      [
        FILA,
        {
          ...FILA,
          id: 9,
          codigo: 'L20',
          estado: 'EN_CONSTRUCCION',
          numeroDeEstaciones: '0',
          longitudKm: null,
        },
      ],
      8,
    );

    const pagina = await new ListarLineasHandler(repositorio).execute(
      new ListarLineas({}, { pagina: 1, tamano: 25 }),
    );

    expect(pagina).toEqual({
      elementos: [
        {
          id: 1,
          codigo: 'L1',
          nombre: 'Centro',
          municipalidad: { id: 1, nombre: 'Guatemala' },
          estado: 'ACTIVA',
          numeroDeEstaciones: 10,
          longitudKm: 7.616,
        },
        expect.objectContaining({ codigo: 'L20', numeroDeEstaciones: 0, longitudKm: null }),
      ],
      total: 8,
      pagina: 1,
      tamano: 25,
    });
  });

  it('aplica los filtros de municipalidad, estado y estación', async () => {
    const { repositorio, llamadas } = constructorSimulado([], 0);

    await new ListarLineasHandler(repositorio).execute(
      new ListarLineas(
        { municipalidadId: 2, estado: 'ACTIVA', estacionId: 4 },
        { pagina: 1, tamano: 25 },
      ),
    );

    const filtros = llamadas.filter(([metodo]) => metodo === 'andWhere').map(([, a]) => a[1]);
    expect(filtros).toEqual(
      expect.arrayContaining([{ municipalidadId: 2 }, { estado: 'ACTIVA' }, { estacionId: 4 }]),
    );
  });

  it('sin filtros no restringe la consulta', async () => {
    const { repositorio, llamadas } = constructorSimulado([], 0);

    await new ListarLineasHandler(repositorio).execute(
      new ListarLineas({}, { pagina: 1, tamano: 25 }),
    );

    expect(llamadas.some(([metodo]) => metodo === 'andWhere')).toBe(false);
  });

  it('salta las filas de las páginas anteriores', async () => {
    const { repositorio, llamadas } = constructorSimulado([], 0);

    await new ListarLineasHandler(repositorio).execute(
      new ListarLineas({}, { pagina: 3, tamano: 10 }),
    );

    expect(llamadas).toEqual(
      expect.arrayContaining([
        ['offset', [20]],
        ['limit', [10]],
      ]),
    );
  });
});
