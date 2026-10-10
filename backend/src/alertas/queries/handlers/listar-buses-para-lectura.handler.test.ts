import type { BusResumen } from '../../../shared/contratos/flota';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarBusesParaLectura } from '../impl/listar-buses-para-lectura.query';
import { ListarBusesParaLecturaHandler } from './listar-buses-para-lectura.handler';

function unBus(
  id: number,
  placa: string,
  lineaId: number,
  estado: BusResumen['estado'] = 'ACTIVO',
): BusResumen {
  return { id, placa, capacidadMax: 100, lineaId, estado };
}

function preparar(): {
  handler: ListarBusesParaLecturaHandler;
  busesDeLinea: jest.Mock;
} {
  const buses: Record<number, BusResumen[]> = {
    1: [unBus(2, 'TM-0002', 1), unBus(1, 'TM-0001', 1), unBus(3, 'TM-0003', 1, 'MANTENIMIENTO')],
    2: [unBus(4, 'TM-0004', 2), unBus(5, 'TM-0005', 2, 'BAJA')],
    3: [unBus(6, 'TM-0006', 3)],
  };
  const red = {
    obtenerRed: jest.fn().mockResolvedValue({
      municipalidades: [],
      estaciones: [],
      lineas: [
        { id: 2, codigo: 'L2', nombre: 'Línea 2', estacionIds: [3, 4] },
        { id: 1, codigo: 'L1', nombre: 'Línea 1', estacionIds: [1, 3] },
        { id: 3, codigo: 'L3', nombre: 'Línea 3', estacionIds: [8, 9] },
      ],
    }),
  } as unknown as RedAdapter;
  const busesDeLinea = jest.fn((id: number) => Promise.resolve(buses[id] ?? []));
  const flota = { busesDeLinea } as unknown as FlotaAdapter;
  return { handler: new ListarBusesParaLecturaHandler(red, flota), busesDeLinea };
}

describe('ListarBusesParaLecturaHandler', () => {
  it('devuelve solo buses activos de las líneas que pasan por la estación, por línea y placa', async () => {
    const { handler, busesDeLinea } = preparar();

    const resultado = await handler.execute(new ListarBusesParaLectura(3));

    expect(resultado.map((bus) => [bus.linea.codigo, bus.placa])).toEqual([
      ['L1', 'TM-0001'],
      ['L1', 'TM-0002'],
      ['L2', 'TM-0004'],
    ]);
    expect(busesDeLinea).not.toHaveBeenCalledWith(3);
    expect(resultado[0]).toEqual({
      id: 1,
      placa: 'TM-0001',
      capacidadMax: 100,
      linea: { id: 1, codigo: 'L1', nombre: 'Línea 1' },
    });
  });

  it('una estación que ninguna línea recorre no tiene buses', async () => {
    const { handler } = preparar();

    await expect(handler.execute(new ListarBusesParaLectura(77))).resolves.toEqual([]);
  });
});
