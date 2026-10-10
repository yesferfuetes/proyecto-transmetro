import type { Repository } from 'typeorm';
import type { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import type { UsuariosAdapter } from '../../infrastructure/adapters/usuarios.adapter';
import { RED } from '../../services/datos-de-prueba';
import { ListarOpcionesDeReporteHandler } from './listar-opciones-de-reporte.handler';

function preparar(autores: { usuarioId: string | number }[]): {
  handler: ListarOpcionesDeReporteHandler;
  obtenerUsuarios: jest.Mock;
} {
  const constructor: object = new Proxy(
    {},
    {
      get: (_objetivo, metodo: string) =>
        metodo === 'getRawMany' ? () => Promise.resolve(autores) : () => constructor,
    },
  );
  const obtenerUsuarios = jest.fn().mockResolvedValue([
    { id: 10, nombre: 'Beto', correo: 'beto@example.com' },
    { id: 9, nombre: 'Ana', correo: 'ana@example.com' },
  ]);
  const handler = new ListarOpcionesDeReporteHandler(
    { createQueryBuilder: () => constructor } as unknown as Repository<ReporteConsulta>,
    { obtenerRed: jest.fn().mockResolvedValue(RED) } as unknown as RedAdapter,
    { obtenerUsuarios } as unknown as UsuariosAdapter,
  );
  return { handler, obtenerUsuarios };
}

describe('ListarOpcionesDeReporteHandler', () => {
  it('trae líneas, estaciones y municipalidades ordenadas, y los usuarios con constancias', async () => {
    const { handler, obtenerUsuarios } = preparar([{ usuarioId: '10' }, { usuarioId: 9 }]);

    const opciones = await handler.execute();

    expect(obtenerUsuarios).toHaveBeenCalledWith([10, 9]);
    expect(opciones.lineas.map((l) => l.codigo)).toEqual(['L1', 'L2', 'L10']);
    expect(opciones.estaciones.map((e) => e.codigo)).toEqual(['E1', 'E2', 'E3', 'E4', 'E10']);
    expect(opciones.municipalidades.map((m) => m.nombre)).toEqual(['Guatemala', 'Mixco']);
    expect(opciones.usuarios.map((u) => u.nombre)).toEqual(['Ana', 'Beto']);
  });

  it('sin constancias no hay usuarios y no se les pregunta', async () => {
    const { handler, obtenerUsuarios } = preparar([]);

    const opciones = await handler.execute();

    expect(opciones.usuarios).toEqual([]);
    expect(obtenerUsuarios).not.toHaveBeenCalled();
  });
});
