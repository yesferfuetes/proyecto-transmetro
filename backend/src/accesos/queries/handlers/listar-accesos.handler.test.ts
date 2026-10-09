import { In, Repository } from 'typeorm';
import type { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import type { Acceso } from '../../entities/acceso.entity';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarAccesos } from '../impl/listar-accesos.query';
import { ListarAccesosHandler } from './listar-accesos.handler';

function estacion(
  id: number,
  nombre: string,
): {
  id: number;
  codigo: string;
  nombre: string;
  municipalidadId: number;
  tieneParqueo: boolean;
} {
  return { id, codigo: `E${id}`, nombre, municipalidadId: 1, tieneParqueo: false };
}

// Desordenadas a propósito: el listado va por código en orden natural (E2 antes que E10).
const TODAS = [
  estacion(10, 'Plaza Barrios'),
  estacion(2, 'Mercado Central'),
  estacion(3, 'Parque Central'),
];

function preparar(): {
  handler: ListarAccesosHandler;
  red: { listarEstaciones: jest.Mock; estacionesDeLinea: jest.Mock };
  accesos: jest.Mock;
} {
  const red = {
    listarEstaciones: jest.fn().mockResolvedValue(TODAS),
    estacionesDeLinea: jest.fn().mockResolvedValue([TODAS[1], TODAS[2]]),
  };
  const accesos = jest
    .fn()
    .mockResolvedValue([{ id: 1, estacionId: 2, codigo: 'A', nombre: null }]);
  const handler = new ListarAccesosHandler(
    red as unknown as RedAdapter,
    { find: accesos } as unknown as Repository<Acceso>,
    {
      find: jest.fn().mockResolvedValue([{ accesoId: 1, guardiaId: 7 }]),
    } as unknown as Repository<AccesoGuardia>,
  );
  return { handler, red, accesos };
}

function codigos(pagina: { elementos: { estacion: { codigo: string } }[] }): string[] {
  return pagina.elementos.map((elemento) => elemento.estacion.codigo);
}

describe('ListarAccesosHandler', () => {
  it('pagina por estación y pide los accesos solo de las estaciones de la página', async () => {
    const { handler, accesos } = preparar();

    const pagina = await handler.execute(new ListarAccesos({}, { pagina: 2, tamano: 2 }));

    expect(codigos(pagina)).toEqual(['E10']);
    expect(pagina).toMatchObject({ total: 3, pagina: 2, tamano: 2 });
    expect(accesos).toHaveBeenCalledWith(
      expect.objectContaining({ where: { estacionId: In([10]) } }),
    );
  });

  it('incluye las estaciones sin accesos con lista vacía y cuenta los guardias', async () => {
    const { handler } = preparar();

    const pagina = await handler.execute(new ListarAccesos({}, { pagina: 1, tamano: 25 }));

    expect(codigos(pagina)).toEqual(['E2', 'E3', 'E10']);
    expect(pagina.elementos[0]?.accesos).toEqual([
      { id: 1, codigo: 'A', nombre: null, guardias: 1 },
    ]);
    expect(pagina.elementos[1]?.accesos).toEqual([]);
  });

  it('filtra por línea con las estaciones de su recorrido', async () => {
    const { handler, red } = preparar();

    const pagina = await handler.execute(
      new ListarAccesos({ lineaId: 4 }, { pagina: 1, tamano: 25 }),
    );

    expect(red.estacionesDeLinea).toHaveBeenCalledWith(4);
    expect(red.listarEstaciones).not.toHaveBeenCalled();
    expect(codigos(pagina)).toEqual(['E2', 'E3']);
  });

  it('filtra por estación', async () => {
    const { handler } = preparar();

    const pagina = await handler.execute(
      new ListarAccesos({ estacionId: 3 }, { pagina: 1, tamano: 25 }),
    );

    expect(codigos(pagina)).toEqual(['E3']);
  });

  it.each([
    ['por nombre, sin importar mayúsculas', ' CENTRAL ', ['E2', 'E3']],
    ['por código', 'e10', ['E10']],
    ['sin coincidencias', 'zzz', []],
    ['en blanco no filtra', '  ', ['E2', 'E3', 'E10']],
  ])('busca %s', async (_caso, busqueda, esperadas) => {
    const { handler } = preparar();

    const pagina = await handler.execute(
      new ListarAccesos({ busqueda }, { pagina: 1, tamano: 25 }),
    );

    expect(codigos(pagina)).toEqual(esperadas);
  });

  it('no consulta accesos si ninguna estación coincide', async () => {
    const { handler, accesos } = preparar();

    await handler.execute(new ListarAccesos({ busqueda: 'zzz' }, { pagina: 1, tamano: 25 }));

    expect(accesos).not.toHaveBeenCalled();
  });
});
