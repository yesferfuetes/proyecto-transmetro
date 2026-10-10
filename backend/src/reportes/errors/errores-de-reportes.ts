import { ReportesError } from './businessError';

export const TIPOS_DE_REPORTE_TEXTO = 'ESTACIONES, LINEAS o BUSES';

export class TipoDeReporteInvalido extends ReportesError {
  constructor() {
    super(
      'TIPO_DE_REPORTE_INVALIDO',
      'REGLA_NEGOCIO',
      `El tipo de reporte debe ser ${TIPOS_DE_REPORTE_TEXTO}.`,
      [{ campo: 'tipo', mensajes: ['Elige estaciones, líneas o buses por línea.'] }],
    );
  }
}

export class LineaNoExiste extends ReportesError {
  constructor() {
    super('LINEA_NO_EXISTE', 'REGLA_NEGOCIO', 'La línea del filtro no existe.', [
      { campo: 'lineaId', mensajes: ['Elige una línea que exista.'] },
    ]);
  }
}

export class EstacionNoExiste extends ReportesError {
  constructor() {
    super('ESTACION_NO_EXISTE', 'REGLA_NEGOCIO', 'La estación del filtro no existe.', [
      { campo: 'estacionId', mensajes: ['Elige una estación que exista.'] },
    ]);
  }
}

export class MunicipalidadNoExiste extends ReportesError {
  constructor() {
    super('MUNICIPALIDAD_NO_EXISTE', 'REGLA_NEGOCIO', 'La municipalidad del filtro no existe.', [
      { campo: 'municipalidadId', mensajes: ['Elige una municipalidad que exista.'] },
    ]);
  }
}

export class RangoDeFechasInvalido extends ReportesError {
  constructor(mensaje: string) {
    super('RANGO_DE_FECHAS_INVALIDO', 'REGLA_NEGOCIO', mensaje, [
      { campo: 'desde', mensajes: [mensaje] },
    ]);
  }
}

export class ConstanciaNoRegistrada extends ReportesError {
  constructor() {
    super(
      'CONSTANCIA_NO_REGISTRADA',
      'REGLA_NEGOCIO',
      'No se pudo dejar constancia de la consulta; el reporte no se entregó. Intenta de nuevo.',
    );
  }
}

export class ConsultaNoExiste extends ReportesError {
  constructor() {
    super('CONSULTA_NO_EXISTE', 'NO_ENCONTRADO', 'La consulta no existe.');
  }
}
