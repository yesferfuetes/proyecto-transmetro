import { EventoAuditable } from '../../shared/auditoria/evento-auditable';

export class AlertaGenerada extends EventoAuditable {
  constructor(
    actorId: number,
    alertaId: number,
    tipo: string,
    estacionId: number,
    busId: number,
    porcentaje: number,
  ) {
    super(actorId, 'ALERTA_GENERADA', 'alerta', String(alertaId), {
      tipo,
      estacionId,
      busId,
      porcentaje,
    });
  }
}

export class AlertaAtendida extends EventoAuditable {
  constructor(actorId: number, alertaId: number, estacionId: number, busId: number) {
    super(actorId, 'ALERTA_ATENDIDA', 'alerta', String(alertaId), { estacionId, busId });
  }
}
