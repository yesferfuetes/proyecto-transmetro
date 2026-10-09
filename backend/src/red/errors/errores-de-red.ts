import type { DetalleDeError } from '../../shared/errors/error-de-negocio';
import { RedError } from './businessError';

export class MunicipalidadDuplicada extends RedError {
  constructor(nombre: string) {
    super(
      'MUNICIPALIDAD_DUPLICADA',
      'CONFLICTO',
      `Ya existe una municipalidad llamada "${nombre}". Usa otro nombre.`,
    );
  }
}

/** La municipalidad pedida por su id no existe. */
export class MunicipalidadNoExiste extends RedError {
  constructor() {
    super('MUNICIPALIDAD_NO_EXISTE', 'NO_ENCONTRADO', 'La municipalidad no existe.');
  }
}

/** La municipalidad indicada para una línea o una estación no existe. */
export class MunicipalidadAsignadaNoExiste extends RedError {
  constructor() {
    super(
      'MUNICIPALIDAD_NO_EXISTE',
      'REGLA_NEGOCIO',
      'La municipalidad indicada no existe. Elige una municipalidad registrada.',
      [{ campo: 'municipalidadId', mensajes: ['La municipalidad no existe.'] }],
    );
  }
}

export class CodigoLineaDuplicado extends RedError {
  constructor(codigo: string) {
    super(
      'CODIGO_LINEA_DUPLICADO',
      'CONFLICTO',
      `Ya existe una línea con el código ${codigo}. Usa otro código.`,
    );
  }
}

export class CodigoEstacionDuplicado extends RedError {
  constructor(codigo: string) {
    super(
      'CODIGO_ESTACION_DUPLICADO',
      'CONFLICTO',
      `Ya existe una estación con el código ${codigo}. Usa otro código.`,
    );
  }
}

export class LineaNoExiste extends RedError {
  constructor() {
    super('LINEA_NO_EXISTE', 'NO_ENCONTRADO', 'La línea no existe.');
  }
}

/** La estación pedida por su id no existe. */
export class EstacionNoExiste extends RedError {
  constructor() {
    super('ESTACION_NO_EXISTE', 'NO_ENCONTRADO', 'La estación no existe.');
  }
}

/** Una o más estaciones del recorrido no existen. */
export class EstacionDelRecorridoNoExiste extends RedError {
  constructor(ids: readonly number[]) {
    super(
      'ESTACION_NO_EXISTE',
      'REGLA_NEGOCIO',
      'El recorrido incluye estaciones que no existen. Quítalas y vuelve a guardar.',
      [{ campo: 'paradas', mensajes: ids.map((id) => `La estación ${id} no existe.`) }],
    );
  }
}

export class EstacionRepetidaEnRecorrido extends RedError {
  constructor(id: number) {
    super(
      'ESTACION_REPETIDA_EN_RECORRIDO',
      'REGLA_NEGOCIO',
      'Una estación aparece más de una vez en el recorrido. Deja solo una.',
      [{ campo: 'paradas', mensajes: [`La estación ${id} aparece más de una vez.`] }],
    );
  }
}

function detalleDeDistancia(posicion: number, mensaje: string): DetalleDeError[] {
  return [{ campo: `paradas.${posicion - 1}.distanciaSiguienteKm`, mensajes: [mensaje] }];
}

export class DistanciaRequerida extends RedError {
  constructor(posicion: number) {
    super(
      'DISTANCIA_REQUERIDA',
      'REGLA_NEGOCIO',
      `Falta la distancia a la siguiente estación en la posición ${posicion}.`,
      detalleDeDistancia(posicion, 'Escribe la distancia a la siguiente estación.'),
    );
  }
}

export class DistanciaInvalida extends RedError {
  constructor(posicion: number) {
    super(
      'DISTANCIA_INVALIDA',
      'REGLA_NEGOCIO',
      `La distancia de la posición ${posicion} debe ser mayor que 0 y no mayor que 999.999 km, con hasta tres decimales.`,
      detalleDeDistancia(posicion, 'Distancia fuera de rango.'),
    );
  }
}

export class RecorridoInsuficiente extends RedError {
  constructor() {
    super(
      'RECORRIDO_INSUFICIENTE',
      'REGLA_NEGOCIO',
      'Una línea activa necesita al menos dos estaciones en su recorrido. Define el recorrido o deja la línea en construcción.',
    );
  }
}

export class EstacionSinLinea extends RedError {
  constructor(codigos: readonly string[]) {
    const lista = codigos.join(', ');
    super(
      'ESTACION_SIN_LINEA',
      'REGLA_NEGOCIO',
      `La estación ${lista} quedaría sin ninguna línea. Inclúyela en otra línea antes de quitarla de esta.`,
      [{ campo: 'paradas', mensajes: codigos.map((codigo) => `${codigo} quedaría sin línea.`) }],
    );
  }
}

export class EstadoLineaInvalido extends RedError {
  constructor() {
    super(
      'ESTADO_LINEA_INVALIDO',
      'REGLA_NEGOCIO',
      'El estado de la línea debe ser activa, inactiva o en construcción.',
      [{ campo: 'estado', mensajes: ['Usa ACTIVA, INACTIVA o EN_CONSTRUCCION.'] }],
    );
  }
}

export class CoordenadasInvalidas extends RedError {
  constructor() {
    super(
      'COORDENADAS_INVALIDAS',
      'REGLA_NEGOCIO',
      'Escribe las dos coordenadas o ninguna: latitud entre -90 y 90 y longitud entre -180 y 180.',
      [{ campo: 'latitud', mensajes: ['Coordenadas incompletas o fuera de rango.'] }],
    );
  }
}

export class EstacionConParqueos extends RedError {
  constructor() {
    super(
      'ESTACION_CON_PARQUEOS',
      'REGLA_NEGOCIO',
      'La estación tiene parqueos registrados; no se le puede quitar la marca de parqueo.',
      [{ campo: 'tieneParqueo', mensajes: ['Elimina primero los parqueos de la estación.'] }],
    );
  }
}
