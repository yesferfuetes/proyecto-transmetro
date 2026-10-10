import { In, Repository } from 'typeorm';
import type { Usuario } from '../../entities/usuario.entity';
import { ObtenerUsuariosResumen } from '../impl/obtener-usuarios-resumen.query';
import { ObtenerUsuariosResumenHandler } from './obtener-usuarios-resumen.handler';

describe('ObtenerUsuariosResumenHandler', () => {
  it('devuelve id, nombre y correo, sin rol ni contraseña, aunque el usuario esté desactivado', async () => {
    const find = jest.fn().mockResolvedValue([
      {
        id: 3,
        nombre: 'Ana',
        email: 'ana@muni.gt',
        rol: 'ADMINISTRADOR',
        activo: false,
        passwordHash: 'scrypt$secreto',
      },
    ]);
    const handler = new ObtenerUsuariosResumenHandler({ find } as unknown as Repository<Usuario>);

    const resumen = await handler.execute(new ObtenerUsuariosResumen([3, 99]));

    expect(resumen).toEqual([{ id: 3, nombre: 'Ana', correo: 'ana@muni.gt' }]);
    expect(find).toHaveBeenCalledWith({ where: { id: In([3, 99]) }, order: { id: 'ASC' } });
  });

  it('sin ids no consulta la base', async () => {
    const find = jest.fn();
    const handler = new ObtenerUsuariosResumenHandler({ find } as unknown as Repository<Usuario>);

    await expect(handler.execute(new ObtenerUsuariosResumen([]))).resolves.toEqual([]);
    expect(find).not.toHaveBeenCalled();
  });
});
