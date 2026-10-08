import type { Repository } from 'typeorm';
import type { Municipalidad } from '../../entities/municipalidad.entity';
import { ListarMunicipalidades } from '../impl/listar-municipalidades.query';
import { ListarMunicipalidadesHandler } from './listar-municipalidades.handler';

function repositorioSimulado(filas: unknown[], total: number): Repository<Municipalidad> {
  const constructor: object = new Proxy(
    {},
    {
      get: (_objetivo, metodo: string) => {
        if (metodo === 'getRawMany') return () => Promise.resolve(filas);
        if (metodo === 'getCount') return () => Promise.resolve(total);
        return () => constructor;
      },
    },
  );
  return { createQueryBuilder: () => constructor } as unknown as Repository<Municipalidad>;
}

describe('ListarMunicipalidadesHandler', () => {
  it('marca "sin red" la municipalidad sin líneas ni estaciones', async () => {
    const repositorio = repositorioSimulado(
      [
        {
          id: 1,
          nombre: 'Guatemala',
          departamento: 'Guatemala',
          fechaIncorporacion: null,
          numeroDeLineas: '8',
          numeroDeEstaciones: '99',
        },
        {
          id: 2,
          nombre: 'Mixco',
          departamento: null,
          fechaIncorporacion: '2026-01-15',
          numeroDeLineas: '0',
          numeroDeEstaciones: '0',
        },
        {
          id: 3,
          nombre: 'Villa Nueva',
          departamento: null,
          fechaIncorporacion: null,
          numeroDeLineas: '0',
          numeroDeEstaciones: '1',
        },
      ],
      3,
    );

    const pagina = await new ListarMunicipalidadesHandler(repositorio).execute(
      new ListarMunicipalidades({ pagina: 1, tamano: 25 }),
    );

    expect(pagina.elementos.map(({ nombre, sinRed }) => [nombre, sinRed])).toEqual([
      ['Guatemala', false],
      ['Mixco', true],
      ['Villa Nueva', false],
    ]);
    expect(pagina.elementos[1]).toEqual({
      id: 2,
      nombre: 'Mixco',
      departamento: null,
      fechaIncorporacion: '2026-01-15',
      numeroDeLineas: 0,
      numeroDeEstaciones: 0,
      sinRed: true,
    });
    expect(pagina).toMatchObject({ total: 3, pagina: 1, tamano: 25 });
  });
});
