import type { Repository } from 'typeorm';
import type { Estacion } from '../../entities/estacion.entity';
import type { LineaEstacion } from '../../entities/linea-estacion.entity';
import { ObtenerEstacion } from '../impl/obtener-estacion.query';
import { ObtenerEstacionHandler } from './obtener-estacion.handler';

const ESTACION = {
  id: 2,
  codigo: 'E2',
  nombre: 'Mercado Central',
  municipalidadId: 1,
  municipalidad: { id: 1, nombre: 'Guatemala' },
  tieneParqueo: true,
  latitud: 14.6,
  longitud: -90.5,
} as Estacion;

function enLinea(id: number, codigo: string, posicion: number): LineaEstacion {
  return {
    lineaId: id,
    estacionId: 2,
    ordenSecuencia: posicion,
    linea: { id, codigo, nombre: `Línea ${codigo}`, estado: 'ACTIVA' },
  } as LineaEstacion;
}

function preparar(estacion: Estacion | null, paradas: LineaEstacion[]): ObtenerEstacionHandler {
  const estaciones = { findOne: jest.fn().mockResolvedValue(estacion) };
  const recorridos = { find: jest.fn().mockResolvedValue(paradas) };
  return new ObtenerEstacionHandler(
    estaciones as unknown as Repository<Estacion>,
    recorridos as unknown as Repository<LineaEstacion>,
  );
}

describe('ObtenerEstacionHandler', () => {
  it('lista las líneas que pasan por la estación con su posición en cada recorrido', async () => {
    const handler = preparar(ESTACION, [enLinea(5, 'L12', 7), enLinea(2, 'L2', 3)]);

    const detalle = await handler.execute(new ObtenerEstacion(2));

    expect(detalle).toEqual({
      id: 2,
      codigo: 'E2',
      nombre: 'Mercado Central',
      municipalidad: { id: 1, nombre: 'Guatemala' },
      tieneParqueo: true,
      latitud: 14.6,
      longitud: -90.5,
      lineas: [
        { id: 2, codigo: 'L2', nombre: 'Línea L2', estado: 'ACTIVA', posicion: 3 },
        { id: 5, codigo: 'L12', nombre: 'Línea L12', estado: 'ACTIVA', posicion: 7 },
      ],
    });
  });

  it('una estación sin línea devuelve la lista vacía', async () => {
    const handler = preparar(ESTACION, []);

    await expect(handler.execute(new ObtenerEstacion(2))).resolves.toMatchObject({ lineas: [] });
  });

  it('devuelve null si la estación no existe', async () => {
    const handler = preparar(null, []);

    await expect(handler.execute(new ObtenerEstacion(99))).resolves.toBeNull();
  });
});
