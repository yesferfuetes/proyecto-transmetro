import { EventoAuditable } from '../../shared/auditoria/evento-auditable';

export class BusRegistrado extends EventoAuditable {
  constructor(
    actorId: number,
    busId: number,
    placa: string,
    lineaId: number | null,
    parqueoId: number,
  ) {
    super(actorId, 'BUS_REGISTRADO', 'bus', String(busId), { placa, lineaId, parqueoId });
  }
}

export class BusEditado extends EventoAuditable {
  constructor(actorId: number, busId: number, capacidadMax: number) {
    super(actorId, 'BUS_EDITADO', 'bus', String(busId), { capacidadMax });
  }
}

export class LineaDeBusCambiada extends EventoAuditable {
  constructor(actorId: number, busId: number, anterior: number | null, nueva: number | null) {
    super(actorId, 'LINEA_DE_BUS_CAMBIADA', 'bus', String(busId), { anterior, nueva });
  }
}

export class ParqueoDeBusCambiado extends EventoAuditable {
  constructor(actorId: number, busId: number, anterior: number, nuevo: number) {
    super(actorId, 'PARQUEO_DE_BUS_CAMBIADO', 'bus', String(busId), { anterior, nuevo });
  }
}

export class EstadoDeBusCambiado extends EventoAuditable {
  constructor(
    actorId: number,
    busId: number,
    anterior: string,
    nuevo: string,
    lineaQuitada: boolean,
  ) {
    super(actorId, 'ESTADO_DE_BUS_CAMBIADO', 'bus', String(busId), {
      anterior,
      nuevo,
      lineaQuitada,
    });
  }
}

export class ParqueoRegistrado extends EventoAuditable {
  constructor(actorId: number, parqueoId: number, estacionId: number, codigo: string) {
    super(actorId, 'PARQUEO_REGISTRADO', 'parqueo', String(parqueoId), { estacionId, codigo });
  }
}

export class ParqueoEditado extends EventoAuditable {
  constructor(actorId: number, parqueoId: number, capacidadVehiculos: number) {
    super(actorId, 'PARQUEO_EDITADO', 'parqueo', String(parqueoId), { capacidadVehiculos });
  }
}

export class ParqueoEliminado extends EventoAuditable {
  constructor(actorId: number, parqueoId: number, codigo: string) {
    super(actorId, 'PARQUEO_ELIMINADO', 'parqueo', String(parqueoId), { codigo });
  }
}
