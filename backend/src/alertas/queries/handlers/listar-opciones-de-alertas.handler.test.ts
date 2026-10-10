import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarOpcionesDeAlertasHandler } from './listar-opciones-de-alertas.handler';

describe('ListarOpcionesDeAlertasHandler', () => {
  it('devuelve estaciones y líneas solo con id, código y nombre', async () => {
    const red = {
      listarEstaciones: jest
        .fn()
        .mockResolvedValue([
          { id: 1, codigo: 'E001', nombre: 'Centro', municipalidadId: 1, tieneParqueo: true },
        ]),
      listarLineas: jest
        .fn()
        .mockResolvedValue([
          { id: 2, codigo: 'L2', nombre: 'Línea 2', estado: 'ACTIVA', numeroDeEstaciones: 3 },
        ]),
    } as unknown as RedAdapter;

    const opciones = await new ListarOpcionesDeAlertasHandler(red).execute();

    expect(opciones).toEqual({
      estaciones: [{ id: 1, codigo: 'E001', nombre: 'Centro' }],
      lineas: [{ id: 2, codigo: 'L2', nombre: 'Línea 2' }],
    });
  });
});
