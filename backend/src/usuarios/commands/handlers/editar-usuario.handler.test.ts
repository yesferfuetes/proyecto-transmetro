import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { EstacionResumen } from '../../../shared/contratos/red';
import { Usuario } from '../../entities/usuario.entity';
import { UsuarioEditado } from '../../events/eventos-de-usuarios';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { CambiosDeUsuario, EditarUsuario } from '../impl/editar-usuario.command';
import { EditarUsuarioHandler } from './editar-usuario.handler';

const ESTACIONES: EstacionResumen[] = [3, 4].map((id) => ({
  id,
  codigo: `E0${id}`,
  nombre: `Estación ${id}`,
  municipalidadId: 1,
  tieneParqueo: false,
}));

const ADMIN_ID = 1;

function usuario(datos: Partial<Usuario>): Usuario {
  return Object.assign(new Usuario(), {
    id: 10,
    nombre: 'Luis Pérez',
    email: 'luis@muni.gt',
    rol: 'OPERADOR_ESTACION',
    estacionId: 3,
    activo: true,
    ...datos,
  });
}

describe('EditarUsuarioHandler', () => {
  let usuarios: Record<'findOneBy' | 'find' | 'update', jest.Mock>;
  let publicar: jest.Mock;
  let handler: EditarUsuarioHandler;

  beforeEach(() => {
    const unidad = new UnidadDeTrabajoSimulada();
    usuarios = { findOneBy: jest.fn(), find: jest.fn(), update: jest.fn() };
    unidad.registrar(Usuario, usuarios as unknown as RepositorioSimulado<Usuario>);
    usuarios.findOneBy.mockImplementation((condicion) =>
      Promise.resolve('id' in condicion ? usuario({}) : null),
    );
    publicar = jest.fn();
    const red = {
      obtenerEstacion: (id: number): Promise<EstacionResumen | null> =>
        Promise.resolve(ESTACIONES.find((estacion) => estacion.id === id) ?? null),
    };
    handler = new EditarUsuarioHandler(
      unidad,
      { publish: publicar } as unknown as EventBus,
      red as unknown as RedAdapter,
    );
  });

  function editar(cambios: CambiosDeUsuario, id = 10): Promise<void> {
    return handler.execute(new EditarUsuario(id, cambios, ADMIN_ID));
  }

  function conUsuario(datos: Partial<Usuario>): void {
    usuarios.findOneBy.mockImplementation((condicion) =>
      Promise.resolve('id' in condicion ? usuario(datos) : null),
    );
  }

  it('al pasar un operador a supervisor retira su estación aunque no se indique', async () => {
    await editar({ rol: 'SUPERVISOR_MUNICIPAL' });

    expect(usuarios.update).toHaveBeenCalledWith(
      { id: 10 },
      expect.objectContaining({ rol: 'SUPERVISOR_MUNICIPAL', estacionId: null }),
    );
    expect(publicar).toHaveBeenCalledWith(new UsuarioEditado(ADMIN_ID, 10, ['rol', 'estacion']));
  });

  it('rechaza pasar un supervisor a operador sin indicar estación', async () => {
    conUsuario({ rol: 'SUPERVISOR_MUNICIPAL', estacionId: null });

    await expect(editar({ rol: 'OPERADOR_ESTACION' })).rejects.toMatchObject({
      codigo: 'OPERADOR_SIN_ESTACION',
    });
    expect(usuarios.update).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it('pasa un supervisor a operador con una estación existente', async () => {
    conUsuario({ rol: 'SUPERVISOR_MUNICIPAL', estacionId: null });

    await editar({ rol: 'OPERADOR_ESTACION', estacionId: 4 });

    expect(usuarios.update).toHaveBeenCalledWith(
      { id: 10 },
      expect.objectContaining({ rol: 'OPERADOR_ESTACION', estacionId: 4 }),
    );
  });

  it.each<[string, CambiosDeUsuario, string]>([
    ['retirar la estación a un operador', { estacionId: null }, 'OPERADOR_SIN_ESTACION'],
    ['una estación inexistente', { estacionId: 99 }, 'ESTACION_NO_EXISTE'],
    ['un rol inválido', { rol: 'GUARDIA' }, 'ROL_INVALIDO'],
    [
      'un supervisor con estación',
      { rol: 'SUPERVISOR_MUNICIPAL', estacionId: 4 },
      'ESTACION_NO_APLICA',
    ],
  ])('rechaza %s', async (_caso, cambios, codigo) => {
    await expect(editar(cambios)).rejects.toMatchObject({ codigo });
    expect(usuarios.update).not.toHaveBeenCalled();
  });

  it('cambia al operador de estación', async () => {
    await editar({ estacionId: 4 });

    expect(usuarios.update).toHaveBeenCalledWith(
      { id: 10 },
      expect.objectContaining({ estacionId: 4 }),
    );
    expect(publicar).toHaveBeenCalledWith(new UsuarioEditado(ADMIN_ID, 10, ['estacion']));
  });

  it('rechaza un correo que ya usa otro usuario', async () => {
    usuarios.findOneBy.mockImplementation((condicion) =>
      Promise.resolve('id' in condicion ? usuario({}) : usuario({ id: 11, email: 'ana@muni.gt' })),
    );

    await expect(editar({ correo: 'ANA@muni.gt' })).rejects.toMatchObject({
      codigo: 'EMAIL_DUPLICADO',
    });
    expect(usuarios.update).not.toHaveBeenCalled();
  });

  it('acepta el mismo correo del usuario escrito con otras mayúsculas sin marcarlo como cambio', async () => {
    await editar({ correo: 'LUIS@muni.gt', nombre: 'Luis Alberto Pérez' });

    expect(publicar).toHaveBeenCalledWith(new UsuarioEditado(ADMIN_ID, 10, ['nombre']));
  });

  it('rechaza editar un usuario inexistente', async () => {
    usuarios.findOneBy.mockResolvedValue(null);

    await expect(editar({ nombre: 'Otro' }, 404)).rejects.toMatchObject({
      codigo: 'USUARIO_NO_EXISTE',
    });
  });

  it('no guarda ni deja constancia si nada cambia', async () => {
    await editar({ nombre: 'Luis Pérez', estacionId: 3 });

    expect(usuarios.update).not.toHaveBeenCalled();
    expect(publicar).not.toHaveBeenCalled();
  });

  it('el evento lista solo los nombres de los campos cambiados, sin sus valores', async () => {
    await editar({ nombre: 'Luis Alberto', correo: 'nuevo@muni.gt' });

    const [evento] = publicar.mock.calls[0] as [UsuarioEditado];
    expect(evento.resumen).toEqual({ campos: 'nombre,correo' });
    expect(JSON.stringify(evento)).not.toContain('nuevo@muni.gt');
  });

  describe('con administradores', () => {
    beforeEach(() => {
      conUsuario({ id: ADMIN_ID, rol: 'ADMINISTRADOR', estacionId: null });
    });

    it('el único administrador activo no puede dejar de serlo; el desactivado no cuenta', async () => {
      // La consulta pide solo administradores activos: el desactivado no aparece en ella.
      usuarios.find.mockResolvedValue([usuario({ id: ADMIN_ID })]);

      await expect(editar({ rol: 'SUPERVISOR_MUNICIPAL' }, ADMIN_ID)).rejects.toMatchObject({
        codigo: 'ULTIMO_ADMINISTRADOR',
      });
      expect(usuarios.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rol: 'ADMINISTRADOR', activo: true },
          lock: { mode: 'pessimistic_write' },
        }),
      );
      expect(usuarios.update).not.toHaveBeenCalled();
    });

    it('un administrador deja de serlo si queda otro activo', async () => {
      usuarios.find.mockResolvedValue([usuario({ id: ADMIN_ID }), usuario({ id: 2 })]);

      await editar({ rol: 'SUPERVISOR_MUNICIPAL' }, ADMIN_ID);

      expect(usuarios.update).toHaveBeenCalledWith(
        { id: ADMIN_ID },
        expect.objectContaining({ rol: 'SUPERVISOR_MUNICIPAL' }),
      );
    });

    it('no cuenta administradores si el rol no cambia', async () => {
      await editar({ nombre: 'Otro nombre' }, ADMIN_ID);

      expect(usuarios.find).not.toHaveBeenCalled();
      expect(usuarios.update).toHaveBeenCalled();
    });
  });
});
