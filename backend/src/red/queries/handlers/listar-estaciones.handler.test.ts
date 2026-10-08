import type { Repository } from 'typeorm';
import type { Estacion } from '../../entities/estacion.entity';
import { ListarEstaciones } from '../impl/listar-estaciones.query';
import { ListarEstacionesHandler } from './listar-estaciones.handler';

type Llamada = [string, unknown[]];

function constructorSimulado(
  filas: unknown[],
  total: number,
): { repositorio: Repository<Estacion>; llamadas: Llamada[] } {
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
  return { repositorio: repositorio as unknown as Repository<Estacion>, llamadas };
}

const FILA = {
  id: 2,
  codigo: 'E002',
  nombre: 'Mercado Central',
  municipalidadId: 1,
  municipalidadNombre: 'Guatemala',
  tieneParqueo: false,
};

describe('ListarEstacionesHandler', () => {
  it('marca "sin línea" la estación que no está en ningún recorrido', async () => {
    const { repositorio } = constructorSimulado(
      [
        {
          ...FILA,
          lineas: [
            { id: 1, codigo: 'L1' },
            { id: 2, codigo: 'L2' },
          ],
        },
        { ...FILA, id: 100, codigo: 'E100', lineas: [] },
      ],
      2,
    );

    const pagina = await new ListarEstacionesHandler(repositorio).execute(
      new ListarEstaciones({}, { pagina: 1, tamano: 25 }),
    );

    expect(pagina.elementos).toEqual([
      {
        id: 2,
        codigo: 'E002',
        nombre: 'Mercado Central',
        municipalidad: { id: 1, nombre: 'Guatemala' },
        tieneParqueo: false,
        lineas: [
          { id: 1, codigo: 'L1' },
          { id: 2, codigo: 'L2' },
        ],
        sinLinea: false,
      },
      expect.objectContaining({ codigo: 'E100', lineas: [], sinLinea: true }),
    ]);
    expect(pagina.total).toBe(2);
  });

  it('aplica los filtros y busca por código o nombre tratando los comodines como texto', async () => {
    const { repositorio, llamadas } = constructorSimulado([], 0);

    await new ListarEstacionesHandler(repositorio).execute(
      new ListarEstaciones(
        { municipalidadId: 1, lineaId: 3, tieneParqueo: false, busqueda: ' 50%_ ' },
        { pagina: 1, tamano: 25 },
      ),
    );

    const filtros = llamadas.filter(([metodo]) => metodo === 'andWhere').map(([, a]) => a[1]);
    expect(filtros).toEqual(
      expect.arrayContaining([
        { municipalidadId: 1 },
        { lineaId: 3 },
        { tieneParqueo: false },
        { patron: '%50\\%\\_%' },
      ]),
    );
  });

  it('ignora una búsqueda en blanco', async () => {
    const { repositorio, llamadas } = constructorSimulado([], 0);

    await new ListarEstacionesHandler(repositorio).execute(
      new ListarEstaciones({ busqueda: '  ' }, { pagina: 1, tamano: 25 }),
    );

    expect(llamadas.some(([metodo]) => metodo === 'andWhere')).toBe(false);
  });
});
