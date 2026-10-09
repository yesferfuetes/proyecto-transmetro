import type { QueryBus } from '@nestjs/cqrs';
import type { BusResumen } from '../../../shared/contratos/flota';
import { EstacionTieneParqueos } from '../../queries/impl/estacion-tiene-parqueos.query';
import { ListarBusesDeLinea } from '../../queries/impl/listar-buses-de-linea.query';
import { ObtenerBusesResumen } from '../../queries/impl/obtener-buses-resumen.query';
import { ConsultasDeFlotaAdapter } from './consultas-de-flota.adapter';

const BUS: BusResumen = {
  id: 1,
  placa: 'TM-0001',
  capacidadMax: 120,
  lineaId: 2,
  estado: 'ACTIVO',
};

function preparar(respuesta: unknown): { adaptador: ConsultasDeFlotaAdapter; execute: jest.Mock } {
  const execute = jest.fn().mockResolvedValue(respuesta);
  const adaptador = new ConsultasDeFlotaAdapter({ execute } as unknown as QueryBus);
  return { adaptador, execute };
}

describe('ConsultasDeFlotaAdapter', () => {
  it('estacionTieneParqueos pregunta por esa estación', async () => {
    const { adaptador, execute } = preparar(true);

    await expect(adaptador.estacionTieneParqueos(3)).resolves.toBe(true);
    expect(execute).toHaveBeenCalledWith(new EstacionTieneParqueos(3));
  });

  it('obtenerBus pide el resumen de ese bus y devuelve null si no existe', async () => {
    const { adaptador, execute } = preparar([BUS]);

    await expect(adaptador.obtenerBus(1)).resolves.toEqual(BUS);
    expect(execute).toHaveBeenCalledWith(new ObtenerBusesResumen([1]));
    execute.mockResolvedValue([]);
    await expect(adaptador.obtenerBus(99)).resolves.toBeNull();
  });

  it('obtenerBuses devuelve solo los que existen', async () => {
    const { adaptador, execute } = preparar([BUS]);

    await expect(adaptador.obtenerBuses([1, 99])).resolves.toEqual([BUS]);
    expect(execute).toHaveBeenCalledWith(new ObtenerBusesResumen([1, 99]));
  });

  it('busesDeLinea pide los buses de esa línea', async () => {
    const { adaptador, execute } = preparar([BUS]);

    await expect(adaptador.busesDeLinea(2)).resolves.toEqual([BUS]);
    expect(execute).toHaveBeenCalledWith(new ListarBusesDeLinea(2));
  });
});
