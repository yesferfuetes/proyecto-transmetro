import { EventoAuditable } from '../../shared/auditoria/evento-auditable';

export class AccesoRegistrado extends EventoAuditable {
  constructor(
    actorId: number,
    accesoId: number,
    estacionId: number,
    codigo: string,
    guardiaId: number,
    turno: string,
  ) {
    super(actorId, 'ACCESO_REGISTRADO', 'acceso', String(accesoId), {
      estacionId,
      codigo,
      guardiaId,
      turno,
    });
  }
}

export class AccesoEditado extends EventoAuditable {
  constructor(actorId: number, accesoId: number, campos: readonly string[]) {
    super(actorId, 'ACCESO_EDITADO', 'acceso', String(accesoId), { campos: campos.join(',') });
  }
}

export class GuardiaRegistrado extends EventoAuditable {
  constructor(actorId: number, guardiaId: number) {
    super(actorId, 'GUARDIA_REGISTRADO', 'guardia_seguridad', String(guardiaId));
  }
}

/** Lleva los nombres de los campos que cambiaron, nunca sus valores (el DPI no se audita). */
export class GuardiaEditado extends EventoAuditable {
  constructor(actorId: number, guardiaId: number, campos: readonly string[]) {
    super(actorId, 'GUARDIA_EDITADO', 'guardia_seguridad', String(guardiaId), {
      campos: campos.join(','),
    });
  }
}

export class GuardiaAsignado extends EventoAuditable {
  constructor(actorId: number, accesoId: number, guardiaId: number, turno: string) {
    super(actorId, 'GUARDIA_ASIGNADO', 'acceso_guardia', String(accesoId), {
      accesoId,
      guardiaId,
      turno,
    });
  }
}

export class AsignacionQuitada extends EventoAuditable {
  constructor(actorId: number, accesoId: number, guardiaId: number, turno: string) {
    super(actorId, 'ASIGNACION_QUITADA', 'acceso_guardia', String(accesoId), {
      accesoId,
      guardiaId,
      turno,
    });
  }
}
