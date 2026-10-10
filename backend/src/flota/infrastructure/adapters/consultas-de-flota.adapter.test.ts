import type { QueryBus } from '@nestjs/cqrs';
import type { BusResumen } from '../../../shared/contratos/flota';
import { EstacionTieneParqueos } from '../../queries/impl/estacion-tiene-parqueos.query';
import { ListarBusesDeLinea } from '../../queries/impl/listar-buses-de-linea.query';
import { ListarBusesParaReporte } from '../../queries/impl/listar-buses-para-reporte.query';
import { ListarFlotaPorLinea } from '../../queries/impl/listar-flota-por-linea.query';
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

  it('listarBuses pide todos los buses con su parqueo', async () => {
    const conParqueo = { ...BUS, parqueo: { id: 4, codigo: 'P1', estacionId: 9 } };
    const { adaptador, execute } = preparar([conParqueo]);

    await expect(adaptador.listarBuses()).resolves.toEqual([conParqueo]);
    expect(execute).toHaveBeenCalledWith(new ListarBusesParaReporte());
  });

  it('resumenDeFlotaPorLinea reutiliza la flota por línea y deja una fila por línea', async () => {
    const { adaptador, execute } = preparar([
      {
        linea: { id: 2, codigo: 'L2', nombre: 'Norte', estado: 'ACTIVA' },
        estaciones: 10,
        minimo: 10,
        maximo: 20,
        buses: 7,
        estadoDeFlota: 'insuficiente',
      },
    ]);

    await expect(adaptador.resumenDeFlotaPorLinea()).resolves.toEqual([
      { lineaId: 2, buses: 7, minimo: 10, maximo: 20, estadoDeFlota: 'insuficiente' },
    ]);
    expect(execute).toHaveBeenCalledWith(new ListarFlotaPorLinea());
  });
});
