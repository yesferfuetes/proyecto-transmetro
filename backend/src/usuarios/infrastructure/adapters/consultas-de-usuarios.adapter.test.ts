import type { QueryBus } from '@nestjs/cqrs';
import { ObtenerUsuariosResumen } from '../../queries/impl/obtener-usuarios-resumen.query';
import { ConsultasDeUsuariosAdapter } from './consultas-de-usuarios.adapter';

describe('ConsultasDeUsuariosAdapter', () => {
  it('obtenerUsuarios pide el resumen de esos ids y devuelve solo los que existen', async () => {
    const resumen = { id: 1, nombre: 'Ana', correo: 'ana@muni.gt' };
    const execute = jest.fn().mockResolvedValue([resumen]);
    const adaptador = new ConsultasDeUsuariosAdapter({ execute } as unknown as QueryBus);

    await expect(adaptador.obtenerUsuarios([1, 99])).resolves.toEqual([resumen]);
    expect(execute).toHaveBeenCalledWith(new ObtenerUsuariosResumen([1, 99]));
  });
});
