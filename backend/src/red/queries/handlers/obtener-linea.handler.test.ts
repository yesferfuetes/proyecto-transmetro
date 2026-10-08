import type { Repository } from 'typeorm';
import type { LineaEstacion } from '../../entities/linea-estacion.entity';
import type { Linea } from '../../entities/linea.entity';
import { ObtenerLinea } from '../impl/obtener-linea.query';
import { ObtenerLineaHandler } from './obtener-linea.handler';

const LINEA = {
  id: 1,
  codigo: 'L1',
  nombre: 'Centro',
  municipalidadId: 1,
  municipalidad: { id: 1, nombre: 'Guatemala' },
  estado: 'ACTIVA',
  longitudKm: 2,
  creadoEn: new Date('2026-10-01T12:00:00Z'),
} as Linea;

function parada(posicion: number, codigo: string, distancia: number | null): LineaEstacion {
  return {
    lineaId: 1,
    estacionId: posicion * 10,
    ordenSecuencia: posicion,
    distanciaSiguienteKm: distancia,
    estacion: {
      id: posicion * 10,
      codigo,
      nombre: `Estación ${codigo}`,
      municipalidad: { nombre: posicion === 2 ? 'Mixco' : 'Guatemala' },
    },
  } as LineaEstacion;
}

function preparar(
  linea: Linea | null,
  paradas: LineaEstacion[],
): { handler: ObtenerLineaHandler; recorridos: { find: jest.Mock } } {
  const lineas = { findOne: jest.fn().mockResolvedValue(linea) };
  const recorridos = { find: jest.fn().mockResolvedValue(paradas) };
  const handler = new ObtenerLineaHandler(
    lineas as unknown as Repository<Linea>,
    recorridos as unknown as Repository<LineaEstacion>,
  );
  return { handler, recorridos };
}

describe('ObtenerLineaHandler', () => {
  it('devuelve el recorrido en orden con la distancia acumulada desde el inicio', async () => {
    const { handler, recorridos } = preparar(LINEA, [
      parada(1, 'E1', 1.2),
      parada(2, 'E2', 0.8),
      parada(3, 'E3', null),
    ]);

    const detalle = await handler.execute(new ObtenerLinea(1));

    expect(recorridos.find.mock.calls).toContainEqual([
      expect.objectContaining({ where: { lineaId: 1 }, order: { ordenSecuencia: 'ASC' } }),
    ]);
    expect(detalle).toMatchObject({
      codigo: 'L1',
      municipalidad: { id: 1, nombre: 'Guatemala' },
      estado: 'ACTIVA',
      longitudKm: 2,
      creadoEn: '2026-10-01T12:00:00.000Z',
    });
    expect(detalle?.recorrido).toEqual([
      {
        posicion: 1,
        estacion: { id: 10, codigo: 'E1', nombre: 'Estación E1', municipalidadNombre: 'Guatemala' },
        distanciaSiguienteKm: 1.2,
        distanciaAcumuladaKm: 0,
      },
      expect.objectContaining({ posicion: 2, distanciaAcumuladaKm: 1.2 }),
      expect.objectContaining({ posicion: 3, distanciaSiguienteKm: null, distanciaAcumuladaKm: 2 }),
    ]);
  });

  it('acumula sin errores de redondeo', async () => {
    const { handler } = preparar(LINEA, [
      parada(1, 'E1', 0.1),
      parada(2, 'E2', 0.2),
      parada(3, 'E3', null),
    ]);

    const detalle = await handler.execute(new ObtenerLinea(1));

    expect(detalle?.recorrido[2]?.distanciaAcumuladaKm).toBe(0.3);
  });

  it('una línea sin recorrido tiene longitud nula y recorrido vacío', async () => {
    const { handler } = preparar({ ...LINEA, longitudKm: null }, []);

    const detalle = await handler.execute(new ObtenerLinea(1));

    expect(detalle).toMatchObject({ longitudKm: null, recorrido: [] });
  });

  it('devuelve null si la línea no existe', async () => {
    const { handler } = preparar(null, []);

    await expect(handler.execute(new ObtenerLinea(99))).resolves.toBeNull();
  });
});
