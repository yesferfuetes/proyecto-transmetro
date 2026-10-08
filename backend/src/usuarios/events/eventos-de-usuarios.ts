import { EventoAuditable } from '../../shared/auditoria/evento-auditable';
import type { Rol } from '../../shared/auth/rol';

const ENTIDAD = 'usuario';

/** Falló un inicio de sesión. Solo guarda el correo escrito: nunca la contraseña. */
export class InicioDeSesionFallido extends EventoAuditable {
  constructor(correoIntentado: string) {
    super(null, 'INICIO_SESION_FALLIDO', ENTIDAD, null, {}, correoIntentado);
  }
}

export class UsuarioRegistrado extends EventoAuditable {
  constructor(actorId: number, usuarioId: number, rol: Rol, estacionId: number | null) {
    super(actorId, 'USUARIO_REGISTRADO', ENTIDAD, String(usuarioId), { rol, estacionId });
  }
}

/** Lleva los nombres de los campos cambiados, sin sus valores. */
export class UsuarioEditado extends EventoAuditable {
  constructor(actorId: number, usuarioId: number, campos: readonly string[]) {
    super(actorId, 'USUARIO_EDITADO', ENTIDAD, String(usuarioId), { campos: campos.join(',') });
  }
}

export class UsuarioDesactivado extends EventoAuditable {
  constructor(actorId: number, usuarioId: number) {
    super(actorId, 'USUARIO_DESACTIVADO', ENTIDAD, String(usuarioId));
  }
}

export class UsuarioReactivado extends EventoAuditable {
  constructor(actorId: number, usuarioId: number) {
    super(actorId, 'USUARIO_REACTIVADO', ENTIDAD, String(usuarioId));
  }
}

export class ContrasenaAsignada extends EventoAuditable {
  constructor(actorId: number, usuarioId: number) {
    super(actorId, 'CONTRASENA_ASIGNADA', ENTIDAD, String(usuarioId));
  }
}

export class ContrasenaCambiada extends EventoAuditable {
  constructor(actorId: number) {
    super(actorId, 'CONTRASENA_CAMBIADA', ENTIDAD, String(actorId));
  }
}
