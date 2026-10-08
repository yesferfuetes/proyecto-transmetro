import { ILike, Repository } from 'typeorm';
import type { EstacionResumen } from '../../../shared/contratos/red';
import { Usuario } from '../../entities/usuario.entity';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarUsuarios } from '../impl/listar-usuarios.query';
import { ListarUsuariosHandler } from './listar-usuarios.handler';

const ESTACION: EstacionResumen = {
  id: 3,
  codigo: 'E03',
  nombre: 'Plaza Barrios',
  municipalidadId: 1,
  tieneParqueo: true,
};

function usuario(datos: Partial<Usuario>): Usuario {
  return Object.assign(new Usuario(), {
    id: 1,
    nombre: 'Ana',
    email: 'ana@muni.gt',
    rol: 'ADMINISTRADOR',
    estacionId: null,
    activo: true,
    creadoEn: new Date('2026-10-01T00:00:00.000Z'),
    ...datos,
  });
}

describe('ListarUsuariosHandler', () => {
  let findAndCount: jest.Mock;
  let obtenerEstaciones: jest.Mock;
  let handler: ListarUsuariosHandler;

  beforeEach(() => {
    findAndCount = jest.fn().mockResolvedValue([[], 0]);
    obtenerEstaciones = jest.fn().mockResolvedValue([ESTACION]);
    handler = new ListarUsuariosHandler(
      { findAndCount } as unknown as Repository<Usuario>,
      { obtenerEstaciones } as unknown as RedAdapter,
    );
  });

  it('pagina y ordena por nombre', async () => {
    await handler.execute(new ListarUsuarios({}, 3, 25));

    expect(findAndCount).toHaveBeenCalledWith({
      where: [{}],
      order: { nombre: 'ASC', id: 'ASC' },
      skip: 50,
      take: 25,
    });
  });

  it('aplica los filtros de rol, estación y estado', async () => {
    await handler.execute(
      new ListarUsuarios({ rol: 'OPERADOR_ESTACION', estacionId: 3, activo: false }, 1, 25),
    );

    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: [{ rol: 'OPERADOR_ESTACION', estacionId: 3, activo: false }],
      }),
    );
  });

  it('busca por nombre o por correo sin distinguir mayúsculas y sin comodines de la persona', async () => {
    await handler.execute(new ListarUsuarios({ activo: true, busqueda: ' 50%_ana ' }, 1, 25));

    const patron = ILike('%50\\%\\_ana%');
    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: [
          { activo: true, nombre: patron },
          { activo: true, email: patron },
        ],
      }),
    );
  });

  it('devuelve la página con la estación completa y sin el hash de la contraseña', async () => {
    findAndCount.mockResolvedValue([
      [
        usuario({ id: 1 }),
        usuario({
          id: 2,
          nombre: 'Luis',
          email: 'luis@muni.gt',
          rol: 'OPERADOR_ESTACION',
          estacionId: 3,
          passwordHash: 'scrypt$secreto',
        }),
      ],
      27,
    ]);

    const pagina = await handler.execute(new ListarUsuarios({}, 2, 25));

    expect(pagina).toEqual({
      elementos: [
        {
          id: 1,
          nombre: 'Ana',
          correo: 'ana@muni.gt',
          rol: 'ADMINISTRADOR',
          estacion: null,
          activo: true,
        },
        {
          id: 2,
          nombre: 'Luis',
          correo: 'luis@muni.gt',
          rol: 'OPERADOR_ESTACION',
          estacion: { id: 3, codigo: 'E03', nombre: 'Plaza Barrios' },
          activo: true,
        },
      ],
      total: 27,
      pagina: 2,
      tamano: 25,
    });
    expect(JSON.stringify(pagina)).not.toContain('scrypt');
  });

  it('pide las estaciones de la página en una sola llamada, sin repetidas', async () => {
    findAndCount.mockResolvedValue([
      [
        usuario({ id: 2, estacionId: 3 }),
        usuario({ id: 3, estacionId: 3 }),
        usuario({ id: 4, estacionId: 5 }),
      ],
      3,
    ]);

    await handler.execute(new ListarUsuarios({}, 1, 25));

    expect(obtenerEstaciones).toHaveBeenCalledTimes(1);
    expect(obtenerEstaciones).toHaveBeenCalledWith([3, 5]);
  });

  it('no consulta la red si nadie en la página tiene estación', async () => {
    findAndCount.mockResolvedValue([[usuario({})], 1]);

    await handler.execute(new ListarUsuarios({}, 1, 25));

    expect(obtenerEstaciones).not.toHaveBeenCalled();
  });
});
