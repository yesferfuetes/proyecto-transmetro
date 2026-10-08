import { EventoAuditable } from '../../shared/auditoria/evento-auditable';

export class MunicipalidadRegistrada extends EventoAuditable {
  constructor(actorId: number, municipalidadId: number, nombre: string) {
    super(actorId, 'MUNICIPALIDAD_REGISTRADA', 'municipalidad', String(municipalidadId), {
      nombre,
    });
  }
}

export class MunicipalidadEditada extends EventoAuditable {
  constructor(actorId: number, municipalidadId: number, campos: readonly string[]) {
    super(actorId, 'MUNICIPALIDAD_EDITADA', 'municipalidad', String(municipalidadId), {
      campos: campos.join(','),
    });
  }
}

export class EstacionRegistrada extends EventoAuditable {
  constructor(actorId: number, estacionId: number, codigo: string) {
    super(actorId, 'ESTACION_REGISTRADA', 'estacion', String(estacionId), { codigo });
  }
}

export class EstacionEditada extends EventoAuditable {
  constructor(actorId: number, estacionId: number, campos: readonly string[]) {
    super(actorId, 'ESTACION_EDITADA', 'estacion', String(estacionId), {
      campos: campos.join(','),
    });
  }
}

export class LineaRegistrada extends EventoAuditable {
  constructor(actorId: number, lineaId: number, codigo: string, estado: string) {
    super(actorId, 'LINEA_REGISTRADA', 'linea', String(lineaId), { codigo, estado });
  }
}

export class LineaEditada extends EventoAuditable {
  constructor(actorId: number, lineaId: number, campos: readonly string[]) {
    super(actorId, 'LINEA_EDITADA', 'linea', String(lineaId), { campos: campos.join(',') });
  }
}

export class EstadoDeLineaCambiado extends EventoAuditable {
  constructor(actorId: number, lineaId: number, anterior: string, nuevo: string) {
    super(actorId, 'ESTADO_LINEA_CAMBIADO', 'linea', String(lineaId), { anterior, nuevo });
  }
}

export class RecorridoDeLineaDefinido extends EventoAuditable {
  constructor(actorId: number, lineaId: number, estaciones: number, longitudKm: number | null) {
    super(actorId, 'RECORRIDO_DEFINIDO', 'linea', String(lineaId), { estaciones, longitudKm });
  }
}
