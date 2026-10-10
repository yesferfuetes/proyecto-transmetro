import { EventoAuditable } from '../../shared/auditoria/evento-auditable';

/** Los eventos llevan ids y nombres de campo, nunca DPI, dirección, teléfono ni correo. */
export class PilotoRegistrado extends EventoAuditable {
  constructor(actorId: number, pilotoId: number, busId: number | null) {
    super(actorId, 'PILOTO_REGISTRADO', 'piloto', String(pilotoId), { busId });
  }
}

export class PilotoEditado extends EventoAuditable {
  constructor(actorId: number, pilotoId: number, campos: readonly string[]) {
    super(actorId, 'PILOTO_EDITADO', 'piloto', String(pilotoId), { campos: campos.join(',') });
  }
}

export class BusDePilotoCambiado extends EventoAuditable {
  constructor(actorId: number, pilotoId: number, anterior: number | null, nuevo: number | null) {
    super(actorId, 'BUS_DE_PILOTO_CAMBIADO', 'piloto', String(pilotoId), { anterior, nuevo });
  }
}
