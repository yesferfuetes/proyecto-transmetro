import type { Repository } from 'typeorm';
import type { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import type { Acceso } from '../../entities/acceso.entity';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarAccesosDeLinea } from '../impl/listar-accesos-de-linea.query';
import { ListarAccesosDeLineaHandler } from './listar-accesos-de-linea.handler';

const LINEA = { id: 1, codigo: 'L1', nombre: 'Línea 1', estado: 'ACTIVA', numeroDeEstaciones: 3 };

function estacion(id: number): {
  id: number;
  codigo: string;
  nombre: string;
  municipalidadId: number;
  tieneParqueo: boolean;
} {
  return {
    id,
    codigo: `E${id}`,
    nombre: `Estación ${id}`,
    municipalidadId: 1,
    tieneParqueo: false,
  };
}

function preparar(linea: typeof LINEA | null = LINEA): {
  handler: ListarAccesosDeLineaHandler;
  accesos: jest.Mock;
  asignaciones: jest.Mock;
} {
  // El recorrido no sigue el orden de los ids: el resultado debe respetarlo.
  const red = {
    obtenerLinea: jest.fn().mockResolvedValue(linea),
    estacionesDeLinea: jest.fn().mockResolvedValue([estacion(30), estacion(10), estacion(20)]),
  } as unknown as RedAdapter;
  const accesos = jest.fn().mockResolvedValue([
    { id: 1, estacionId: 10, codigo: 'A', nombre: 'Principal' },
    { id: 2, estacionId: 10, codigo: 'B', nombre: null },
    { id: 3, estacionId: 30, codigo: 'A', nombre: null },
  ]);
  const asignaciones = jest.fn().mockResolvedValue([
    { accesoId: 1, guardiaId: 7 },
    { accesoId: 1, guardiaId: 8 },
    { accesoId: 1, guardiaId: 7 },
    { accesoId: 3, guardiaId: 7 },
  ]);
  const handler = new ListarAccesosDeLineaHandler(
    red,
    { find: accesos } as unknown as Repository<Acceso>,
    { find: asignaciones } as unknown as Repository<AccesoGuardia>,
  );
  return { handler, accesos, asignaciones };
}

describe('ListarAccesosDeLineaHandler', () => {
  it('lista las estaciones en orden de recorrido con sus accesos y guardias distintos', async () => {
    const { handler } = preparar();

    const resultado = await handler.execute(new ListarAccesosDeLinea(1));

    expect(resultado.linea).toEqual({ id: 1, codigo: 'L1', nombre: 'Línea 1' });
    expect(resultado.estaciones.map(({ posicion, id }) => [posicion, id])).toEqual([
      [1, 30],
      [2, 10],
      [3, 20],
    ]);
    expect(resultado.estaciones[1]?.accesos).toEqual([
      { id: 1, codigo: 'A', nombre: 'Principal', guardias: 2 },
      { id: 2, codigo: 'B', nombre: null, guardias: 0 },
    ]);
    expect(resultado.estaciones[0]?.accesos).toEqual([
      { id: 3, codigo: 'A', nombre: null, guardias: 1 },
    ]);
  });

  it('marca "sin accesos" la estación que no tiene ninguno', async () => {
    const { handler } = preparar();

    const { estaciones } = await handler.execute(new ListarAccesosDeLinea(1));

    expect(estaciones.map((e) => e.sinAccesos)).toEqual([false, false, true]);
    expect(estaciones[2]).toMatchObject({ id: 20, accesos: [], sinAccesos: true });
  });

  it('pide los accesos de todas las estaciones de la línea en una sola consulta', async () => {
    const { handler, accesos } = preparar();

    await handler.execute(new ListarAccesosDeLinea(1));

    expect(accesos).toHaveBeenCalledTimes(1);
  });

  it('responde LINEA_NO_EXISTE si la red no la encuentra', async () => {
    const { handler, accesos } = preparar(null);

    await expect(handler.execute(new ListarAccesosDeLinea(99))).rejects.toMatchObject({
      codigo: 'LINEA_NO_EXISTE',
      tipo: 'NO_ENCONTRADO',
    });
    expect(accesos).not.toHaveBeenCalled();
  });
});
