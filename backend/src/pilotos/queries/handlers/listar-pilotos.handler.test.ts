import { crearRepositorioSimulado } from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { BusResumen } from '../../../shared/contratos/flota';
import type { LineaResumen } from '../../../shared/contratos/red';
import { Piloto } from '../../entities/piloto.entity';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarPilotos } from '../impl/listar-pilotos.query';
import { ListarPilotosHandler } from './listar-pilotos.handler';

const CAMPOS_PERSONALES = ['dpi', 'direccionResidencia', 'correo', 'email', 'historialEducativo'];

function piloto(id: number, busId: number | null): Piloto {
  return {
    id,
    nombre: `Piloto ${id}`,
    dpi: '1234 56789 0101',
    direccionResidencia: 'Zona 1',
    telefono: '5555-1234',
    email: 'p@correo.com',
    historialEducativo: 'Diversificado',
    busId,
  };
}

const BUS_ACTIVO: BusResumen = {
  id: 5,
  placa: 'TM-0005',
  capacidadMax: 100,
  lineaId: 3,
  estado: 'ACTIVO',
};
const BUS_DE_BAJA: BusResumen = {
  id: 6,
  placa: 'TM-0006',
  capacidadMax: 100,
  lineaId: null,
  estado: 'BAJA',
};
const LINEA: LineaResumen = {
  id: 3,
  codigo: 'L3',
  nombre: 'Línea 3',
  estado: 'ACTIVA',
  numeroDeEstaciones: 4,
};

function preparar(
  filas: Piloto[],
  total = filas.length,
): {
  handler: ListarPilotosHandler;
  where: jest.Mock;
  repositorio: ReturnType<typeof crearRepositorioSimulado<Piloto>>;
  flota: Record<string, jest.Mock>;
  red: Record<string, jest.Mock>;
} {
  const repositorio = crearRepositorioSimulado<Piloto>();
  const where = jest.fn();
  const constructor: Record<string, jest.Mock> = {};
  for (const metodo of ['andWhere', 'orderBy', 'addOrderBy', 'skip', 'take']) {
    constructor[metodo] = jest.fn().mockImplementation((...argumentos: unknown[]) => {
      if (metodo === 'andWhere') {
        where(...argumentos);
      }
      return constructor;
    });
  }
  constructor.getCount = jest.fn().mockResolvedValue(total);
  constructor.getMany = jest.fn().mockResolvedValue(filas);
  (repositorio as unknown as Record<string, jest.Mock>).createQueryBuilder = jest
    .fn()
    .mockReturnValue(constructor);
  const flota = {
    obtenerBuses: jest.fn().mockResolvedValue([BUS_ACTIVO, BUS_DE_BAJA]),
    busesDeLinea: jest.fn().mockResolvedValue([BUS_ACTIVO]),
  };
  const red = { obtenerLineas: jest.fn().mockResolvedValue([LINEA]) };
  const handler = new ListarPilotosHandler(
    repositorio,
    flota as unknown as FlotaAdapter,
    red as unknown as RedAdapter,
  );
  return { handler, where, repositorio, flota, red };
}

const PAGINA = { pagina: 1, tamano: 25 };

describe('ListarPilotosHandler', () => {
  it('deriva la línea del bus con una llamada a flota y una a la red', async () => {
    const { handler, flota, red } = preparar([piloto(1, 5), piloto(2, 5), piloto(3, null)]);

    const resultado = await handler.execute(new ListarPilotos({}, false, PAGINA));

    expect(resultado.elementos[0]).toEqual({
      id: 1,
      nombre: 'Piloto 1',
      telefono: '5555-1234',
      bus: { id: 5, placa: 'TM-0005', estado: 'ACTIVO' },
      linea: { id: 3, codigo: 'L3', nombre: 'Línea 3' },
      busDeBaja: false,
    });
    expect(resultado.elementos[2]).toMatchObject({ bus: null, linea: null, busDeBaja: false });
    expect(flota.obtenerBuses).toHaveBeenCalledTimes(1);
    expect(flota.obtenerBuses).toHaveBeenCalledWith([5]);
    expect(red.obtenerLineas).toHaveBeenCalledTimes(1);
    expect(resultado).toMatchObject({ total: 3, pagina: 1, tamano: 25 });
  });

  it('la vista reducida no contiene ningún campo personal', async () => {
    const { handler } = preparar([piloto(1, 5), piloto(2, null)]);

    const { elementos } = await handler.execute(new ListarPilotos({}, false, PAGINA));

    for (const elemento of elementos) {
      expect(Object.keys(elemento).sort()).toEqual(
        ['busDeBaja', 'bus', 'id', 'linea', 'nombre', 'telefono'].sort(),
      );
      for (const campo of CAMPOS_PERSONALES) {
        expect(elemento).not.toHaveProperty(campo);
      }
    }
    expect(JSON.stringify(elementos)).not.toMatch(/1234 56789|Zona 1|correo\.com|Diversificado/);
  });

  it('la vista completa agrega el DPI y nada más', async () => {
    const { handler } = preparar([piloto(1, 5)]);

    const { elementos } = await handler.execute(new ListarPilotos({}, true, PAGINA));

    expect(elementos[0]).toMatchObject({ dpi: '1234 56789 0101' });
    expect(elementos[0]).not.toHaveProperty('direccionResidencia');
    expect(elementos[0]).not.toHaveProperty('historialEducativo');
  });

  it('avisa cuando el bus está de baja', async () => {
    const { handler } = preparar([piloto(1, 6)]);

    const { elementos } = await handler.execute(new ListarPilotos({}, false, PAGINA));

    expect(elementos[0]).toMatchObject({
      bus: { id: 6, estado: 'BAJA' },
      linea: null,
      busDeBaja: true,
    });
  });

  it('filtra por línea con los buses de la línea', async () => {
    const { handler, where, flota } = preparar([piloto(1, 5)]);

    await handler.execute(new ListarPilotos({ lineaId: 3 }, false, PAGINA));

    expect(flota.busesDeLinea).toHaveBeenCalledWith(3);
    expect(where).toHaveBeenCalledWith('p.busId IN (:...busesDeLinea)', { busesDeLinea: [5] });
  });

  it('una línea sin buses no devuelve pilotos', async () => {
    const { handler, where, flota } = preparar([]);
    flota.busesDeLinea.mockResolvedValue([]);

    await handler.execute(new ListarPilotos({ lineaId: 9 }, false, PAGINA));

    expect(where).toHaveBeenCalledWith('1 = 0');
  });

  it('filtra por bus', async () => {
    const { handler, where } = preparar([piloto(1, 5)]);

    await handler.execute(new ListarPilotos({ busId: 5 }, false, PAGINA));

    expect(where).toHaveBeenCalledWith('p.busId = :busId', { busId: 5 });
  });

  it('"sin bus" filtra por bus nulo y tiene prioridad sobre la línea y el bus', async () => {
    const { handler, where, flota } = preparar([piloto(1, null)]);

    await handler.execute(new ListarPilotos({ sinBus: true, lineaId: 3, busId: 5 }, false, PAGINA));

    expect(where.mock.calls).toEqual([['p.busId IS NULL'], ['p.busId IS NULL']]);
    expect(flota.busesDeLinea).not.toHaveBeenCalled();
  });

  it('el operador busca solo por nombre', async () => {
    const { handler, where } = preparar([]);

    await handler.execute(new ListarPilotos({ busqueda: 'José 1234' }, false, PAGINA));

    const [condicion, parametros] = where.mock.calls[0] as [string, Record<string, string>];
    expect(condicion).toContain('p.nombre');
    expect(condicion).not.toContain('dpi');
    expect(parametros).toEqual({ patron: '%José 1234%' });
  });

  it('supervisor y administrador buscan también por DPI sin espacios', async () => {
    const { handler, where } = preparar([]);

    await handler.execute(new ListarPilotos({ busqueda: '1234 5678' }, true, PAGINA));

    const [condicion, parametros] = where.mock.calls[0] as [string, Record<string, string>];
    expect(condicion).toContain("REPLACE(p.dpi, ' ', '')");
    expect(parametros).toEqual({ patron: '%1234 5678%', patronDpi: '%12345678%' });
  });

  it('escapa los comodines de la búsqueda', async () => {
    const { handler, where } = preparar([]);

    await handler.execute(new ListarPilotos({ busqueda: '50%_\\' }, false, PAGINA));

    expect((where.mock.calls[0] as [string, unknown])[1]).toEqual({ patron: '%50\\%\\_\\\\%' });
  });

  it('ignora una búsqueda en blanco', async () => {
    const { handler, where } = preparar([]);

    await handler.execute(new ListarPilotos({ busqueda: '   ' }, true, PAGINA));

    expect(where).not.toHaveBeenCalled();
  });

  it('no consulta flota ni red cuando no hay pilotos', async () => {
    const { handler, flota, red } = preparar([]);

    await handler.execute(new ListarPilotos({}, false, PAGINA));

    expect(flota.obtenerBuses).not.toHaveBeenCalled();
    expect(red.obtenerLineas).not.toHaveBeenCalled();
  });

  it('solo lee: no escribe en el repositorio', async () => {
    const { handler, repositorio } = preparar([piloto(1, 5)]);

    await handler.execute(new ListarPilotos({}, true, PAGINA));

    expect(repositorio.save.mock.calls).toHaveLength(0);
    expect(repositorio.update.mock.calls).toHaveLength(0);
    expect(repositorio.insert.mock.calls).toHaveLength(0);
    expect(repositorio.delete.mock.calls).toHaveLength(0);
  });
});
