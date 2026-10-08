import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { EventoAuditable } from '../../../shared/auditoria/evento-auditable';
import { Auditoria } from '../../entities/auditoria.entity';
import {
  ContrasenaAsignada,
  InicioDeSesionFallido,
  UsuarioDesactivado,
  UsuarioRegistrado,
} from '../../events/eventos-de-usuarios';
import { RegistrarAuditoria } from '../impl/registrar-auditoria.command';
import { RegistrarAuditoriaHandler } from './registrar-auditoria.handler';

/** Aviso de otro módulo que, por error, intenta incluir una contraseña en el resumen. */
class EventoConDatosSensibles extends EventoAuditable {
  constructor() {
    super(3, 'PILOTO_EDITADO', 'piloto', '8', {
      campos: 'nombre',
      contrasena: 'NoDebeQuedar1',
      passwordHash: 'scrypt$x',
    });
  }
}

describe('RegistrarAuditoriaHandler', () => {
  let unidad: UnidadDeTrabajoSimulada;
  let auditoria: Record<'insert', jest.Mock>;
  let handler: RegistrarAuditoriaHandler;

  beforeEach(() => {
    unidad = new UnidadDeTrabajoSimulada();
    auditoria = { insert: jest.fn() };
    unidad.registrar(Auditoria, auditoria as unknown as RepositorioSimulado<Auditoria>);
    handler = new RegistrarAuditoriaHandler(unidad);
  });

  it('transcribe la desactivación con el administrador, la acción y el usuario afectado', async () => {
    await handler.execute(new RegistrarAuditoria(new UsuarioDesactivado(1, 9)));

    expect(unidad.ejecuciones).toBe(1);
    expect(auditoria.insert).toHaveBeenCalledWith({
      usuarioId: 1,
      correoIntentado: null,
      accion: 'USUARIO_DESACTIVADO',
      entidad: 'usuario',
      entidadId: '9',
      resumen: '{}',
    });
  });

  it('guarda el resumen como JSON', async () => {
    await handler.execute(
      new RegistrarAuditoria(new UsuarioRegistrado(1, 20, 'OPERADOR_ESTACION', 3)),
    );

    expect(auditoria.insert).toHaveBeenCalledWith(
      expect.objectContaining({ resumen: '{"rol":"OPERADOR_ESTACION","estacionId":3}' }),
    );
  });

  it('un inicio de sesión fallido guarda el correo intentado y ningún usuario', async () => {
    await handler.execute(new RegistrarAuditoria(new InicioDeSesionFallido('nadie@muni.gt')));

    expect(auditoria.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioId: null,
        correoIntentado: 'nadie@muni.gt',
        accion: 'INICIO_SESION_FALLIDO',
      }),
    );
  });

  it('la asignación de contraseña queda registrada sin la contraseña', async () => {
    await handler.execute(new RegistrarAuditoria(new ContrasenaAsignada(1, 9)));

    expect(auditoria.insert).toHaveBeenCalledWith(
      expect.objectContaining({ accion: 'CONTRASENA_ASIGNADA', resumen: '{}' }),
    );
  });

  it('el resumen nunca guarda contraseñas aunque el aviso las traiga', async () => {
    await handler.execute(new RegistrarAuditoria(new EventoConDatosSensibles()));

    expect(auditoria.insert).toHaveBeenCalledWith(
      expect.objectContaining({ resumen: '{"campos":"nombre"}' }),
    );
    expect(JSON.stringify(auditoria.insert.mock.calls)).not.toContain('NoDebeQuedar1');
  });
});
