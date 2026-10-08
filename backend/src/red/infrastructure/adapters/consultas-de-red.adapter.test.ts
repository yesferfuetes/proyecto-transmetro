import type { QueryBus } from '@nestjs/cqrs';
import { ListarEstacionesDeLinea } from '../../queries/impl/listar-estaciones-de-linea.query';
import { ObtenerEstacionesResumen } from '../../queries/impl/obtener-estaciones-resumen.query';
import { ObtenerLineasResumen } from '../../queries/impl/obtener-lineas-resumen.query';
import { ConsultasDeRedAdapter } from './consultas-de-red.adapter';

const ESTACION = { id: 1, codigo: 'E1', nombre: 'Uno', municipalidadId: 1, tieneParqueo: false };
const LINEA = { id: 1, codigo: 'L1', nombre: 'Centro', estado: 'ACTIVA', numeroDeEstaciones: 10 };

function preparar(respuesta: unknown): { adaptador: ConsultasDeRedAdapter; execute: jest.Mock } {
  const execute = jest.fn().mockResolvedValue(respuesta);
  const adaptador = new ConsultasDeRedAdapter({ execute } as unknown as QueryBus);
  return { adaptador, execute };
}

describe('ConsultasDeRedAdapter', () => {
  it('obtenerEstacion pide el resumen de esa estación', async () => {
    const { adaptador, execute } = preparar([ESTACION]);

    await expect(adaptador.obtenerEstacion(1)).resolves.toEqual(ESTACION);
    expect(execute).toHaveBeenCalledWith(new ObtenerEstacionesResumen([1]));
  });

  it('obtenerEstacion devuelve null si no existe', async () => {
    const { adaptador } = preparar([]);

    await expect(adaptador.obtenerEstacion(99)).resolves.toBeNull();
  });

  it('obtenerEstaciones devuelve solo las que existen', async () => {
    const { adaptador, execute } = preparar([ESTACION]);

    await expect(adaptador.obtenerEstaciones([1, 99])).resolves.toEqual([ESTACION]);
    expect(execute).toHaveBeenCalledWith(new ObtenerEstacionesResumen([1, 99]));
  });

  it('listarEstaciones pide todas', async () => {
    const { adaptador, execute } = preparar([ESTACION]);

    await expect(adaptador.listarEstaciones()).resolves.toEqual([ESTACION]);
    expect(execute).toHaveBeenCalledWith(new ObtenerEstacionesResumen());
  });

  it('obtenerLinea pide el resumen de esa línea y devuelve null si no existe', async () => {
    const { adaptador, execute } = preparar([LINEA]);

    await expect(adaptador.obtenerLinea(1)).resolves.toEqual(LINEA);
    expect(execute).toHaveBeenCalledWith(new ObtenerLineasResumen([1]));
    execute.mockResolvedValue([]);
    await expect(adaptador.obtenerLinea(99)).resolves.toBeNull();
  });

  it('obtenerLineas devuelve una lista vacía si ninguna existe', async () => {
    const { adaptador, execute } = preparar([]);

    await expect(adaptador.obtenerLineas([98, 99])).resolves.toEqual([]);
    expect(execute).toHaveBeenCalledWith(new ObtenerLineasResumen([98, 99]));
  });

  it('estacionesDeLinea delega en el recorrido de la línea', async () => {
    const { adaptador, execute } = preparar([ESTACION]);

    await expect(adaptador.estacionesDeLinea(1)).resolves.toEqual([ESTACION]);
    expect(execute).toHaveBeenCalledWith(new ListarEstacionesDeLinea(1));
  });
});
