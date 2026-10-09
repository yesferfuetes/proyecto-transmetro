import { FlotaError } from './businessError';

export const CAPACIDAD_MAXIMA_DE_BUS = 300;
export const LARGO_MAXIMO_DE_PLACA = 15;

export class PlacaInvalida extends FlotaError {
  constructor() {
    super(
      'PLACA_INVALIDA',
      'REGLA_NEGOCIO',
      `La placa debe tener de 1 a ${LARGO_MAXIMO_DE_PLACA} caracteres.`,
      [{ campo: 'placa', mensajes: ['Escribe una placa de 1 a 15 caracteres.'] }],
    );
  }
}

export class PlacaDuplicada extends FlotaError {
  constructor(placa: string) {
    super('PLACA_DUPLICADA', 'CONFLICTO', `Ya existe un bus con la placa ${placa}.`);
  }
}

export class CapacidadInvalida extends FlotaError {
  constructor(campo: string, mensaje: string) {
    super('CAPACIDAD_INVALIDA', 'REGLA_NEGOCIO', mensaje, [{ campo, mensajes: [mensaje] }]);
  }
}

export class BusSinParqueo extends FlotaError {
  constructor() {
    super('BUS_SIN_PARQUEO', 'REGLA_NEGOCIO', 'Todo bus necesita un parqueo. Elige uno.', [
      { campo: 'parqueoId', mensajes: ['Elige el parqueo del bus.'] },
    ]);
  }
}

export class ParqueoLleno extends FlotaError {
  constructor(codigo: string, capacidad: number) {
    super(
      'PARQUEO_LLENO',
      'REGLA_NEGOCIO',
      `El parqueo ${codigo} ya guarda sus ${capacidad} vehículos. Elige otro.`,
      [{ campo: 'parqueoId', mensajes: ['El parqueo no tiene cupo.'] }],
    );
  }
}

export class CapacidadParqueoInsuficiente extends FlotaError {
  constructor(codigo: string, buses: number) {
    super(
      'CAPACIDAD_PARQUEO_INSUFICIENTE',
      'REGLA_NEGOCIO',
      `El parqueo ${codigo} guarda ${buses} buses; su capacidad no puede ser menor.`,
      [{ campo: 'capacidadVehiculos', mensajes: [`Debe ser al menos ${buses}.`] }],
    );
  }
}

/** La línea indicada como dato de entrada no existe. */
export class LineaNoExiste extends FlotaError {
  constructor() {
    super('LINEA_NO_EXISTE', 'REGLA_NEGOCIO', 'La línea indicada no existe.', [
      { campo: 'lineaId', mensajes: ['La línea no existe.'] },
    ]);
  }
}

export class LineaInactiva extends FlotaError {
  constructor(codigo: string) {
    super(
      'LINEA_INACTIVA',
      'REGLA_NEGOCIO',
      `La línea ${codigo} está inactiva y no recibe buses. Elige otra.`,
      [{ campo: 'lineaId', mensajes: ['La línea está inactiva.'] }],
    );
  }
}

export class FlotaMaximaExcedida extends FlotaError {
  constructor(codigo: string, maximo: number, buses: number) {
    super(
      'FLOTA_MAXIMA_EXCEDIDA',
      'REGLA_NEGOCIO',
      `La línea ${codigo} admite como máximo ${maximo} buses y ya tiene ${buses}.`,
      [{ campo: 'lineaId', mensajes: [`Máximo de ${maximo} buses.`] }],
    );
  }
}

export class FlotaMinimaInsuficiente extends FlotaError {
  constructor(codigo: string, minimo: number, buses: number) {
    super(
      'FLOTA_MINIMA_INSUFICIENTE',
      'REGLA_NEGOCIO',
      `La línea ${codigo} activa necesita al menos ${minimo} buses y tiene ${buses}.`,
    );
  }
}

export class EstadoBusInvalido extends FlotaError {
  constructor() {
    super(
      'ESTADO_BUS_INVALIDO',
      'REGLA_NEGOCIO',
      'El estado del bus debe ser activo, en mantenimiento o de baja.',
      [{ campo: 'estado', mensajes: ['Usa ACTIVO, MANTENIMIENTO o BAJA.'] }],
    );
  }
}

export class BusDeBaja extends FlotaError {
  constructor() {
    super(
      'BUS_DE_BAJA',
      'REGLA_NEGOCIO',
      'El bus está de baja: la baja es definitiva y ya no admite cambios de línea ni de estado.',
    );
  }
}

export class EstacionSinParqueo extends FlotaError {
  constructor() {
    super(
      'ESTACION_SIN_PARQUEO',
      'REGLA_NEGOCIO',
      'La estación no está marcada con parqueo. Márcala en la red antes de registrar uno.',
      [{ campo: 'estacionId', mensajes: ['La estación no tiene parqueo.'] }],
    );
  }
}

export class CodigoParqueoDuplicado extends FlotaError {
  constructor(codigo: string) {
    super(
      'CODIGO_PARQUEO_DUPLICADO',
      'CONFLICTO',
      `La estación ya tiene un parqueo con el código ${codigo}. Usa otro código.`,
    );
  }
}

export class ParqueoConBuses extends FlotaError {
  constructor(codigo: string) {
    super(
      'PARQUEO_CON_BUSES',
      'REGLA_NEGOCIO',
      `El parqueo ${codigo} todavía guarda buses. Cámbialos de parqueo antes de eliminarlo.`,
    );
  }
}

export class BusNoExiste extends FlotaError {
  constructor() {
    super('BUS_NO_EXISTE', 'NO_ENCONTRADO', 'El bus no existe.');
  }
}

/** El parqueo pedido por su id no existe. */
export class ParqueoNoExiste extends FlotaError {
  constructor() {
    super('PARQUEO_NO_EXISTE', 'NO_ENCONTRADO', 'El parqueo no existe.');
  }
}

/** El parqueo indicado como dato de entrada no existe. */
export class ParqueoIndicadoNoExiste extends FlotaError {
  constructor() {
    super('PARQUEO_NO_EXISTE', 'REGLA_NEGOCIO', 'El parqueo indicado no existe.', [
      { campo: 'parqueoId', mensajes: ['El parqueo no existe.'] },
    ]);
  }
}

/** La estación indicada como dato de entrada no existe. */
export class EstacionNoExiste extends FlotaError {
  constructor() {
    super('ESTACION_NO_EXISTE', 'REGLA_NEGOCIO', 'La estación indicada no existe.', [
      { campo: 'estacionId', mensajes: ['La estación no existe.'] },
    ]);
  }
}
