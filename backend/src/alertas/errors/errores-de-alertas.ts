import { AlertasError } from './businessError';

export class EstacionAjena extends AlertasError {
  constructor() {
    super(
      'ESTACION_AJENA',
      'PROHIBIDO',
      'Solo puedes registrar y atender alertas de tu propia estación.',
    );
  }
}

export class BusNoExiste extends AlertasError {
  constructor() {
    super('BUS_NO_EXISTE', 'REGLA_NEGOCIO', 'El bus indicado no existe.', [
      { campo: 'busId', mensajes: ['El bus no existe.'] },
    ]);
  }
}

export class BusNoOperativo extends AlertasError {
  constructor(placa: string) {
    super(
      'BUS_NO_OPERATIVO',
      'REGLA_NEGOCIO',
      `El bus ${placa} no está activo: está en mantenimiento o de baja.`,
      [{ campo: 'busId', mensajes: ['El bus no está activo.'] }],
    );
  }
}

export class BusNoSirveALaEstacion extends AlertasError {
  constructor(placa: string) {
    super(
      'BUS_NO_SIRVE_A_LA_ESTACION',
      'REGLA_NEGOCIO',
      `El bus ${placa} no tiene línea o su línea no pasa por esta estación.`,
      [{ campo: 'busId', mensajes: ['El bus no sirve a esta estación.'] }],
    );
  }
}

export class PasajerosInvalidos extends AlertasError {
  constructor(mensaje: string) {
    super('PASAJEROS_INVALIDOS', 'REGLA_NEGOCIO', mensaje, [
      { campo: 'pasajeros', mensajes: [mensaje] },
    ]);
  }
}

export class PasajerosExcedenCapacidad extends AlertasError {
  constructor(capacidad: number) {
    super(
      'PASAJEROS_EXCEDEN_CAPACIDAD',
      'REGLA_NEGOCIO',
      `Los pasajeros a bordo no pueden superar la capacidad del bus (${capacidad}).`,
      [{ campo: 'pasajeros', mensajes: [`Máximo ${capacidad} pasajeros.`] }],
    );
  }
}

export class AlertaPendienteExistente extends AlertasError {
  constructor() {
    super(
      'ALERTA_PENDIENTE_EXISTENTE',
      'CONFLICTO',
      'Ya hay una alerta pendiente para este bus en tu estación.',
    );
  }
}

export class AlertaYaAtendida extends AlertasError {
  constructor() {
    super('ALERTA_YA_ATENDIDA', 'CONFLICTO', 'La alerta ya fue atendida.');
  }
}

export class AlertaNoExiste extends AlertasError {
  constructor() {
    super('ALERTA_NO_EXISTE', 'NO_ENCONTRADO', 'La alerta no existe.');
  }
}
