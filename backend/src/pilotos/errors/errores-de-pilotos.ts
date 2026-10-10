import { PilotosError } from './businessError';

export class NombreInvalido extends PilotosError {
  constructor() {
    super(
      'NOMBRE_INVALIDO',
      'REGLA_NEGOCIO',
      'El nombre del piloto tiene de 1 a 150 caracteres. Revísalo y vuelve a escribirlo.',
      [{ campo: 'nombre', mensajes: ['El nombre debe tener de 1 a 150 caracteres.'] }],
    );
  }
}

export class DpiInvalido extends PilotosError {
  constructor() {
    super(
      'DPI_INVALIDO',
      'REGLA_NEGOCIO',
      'El DPI tiene 13 dígitos. Revísalo y vuelve a escribirlo.',
      [{ campo: 'dpi', mensajes: ['El DPI debe tener 13 dígitos.'] }],
    );
  }
}

export class DpiPilotoDuplicado extends PilotosError {
  constructor() {
    super('DPI_PILOTO_DUPLICADO', 'CONFLICTO', 'Ya hay un piloto registrado con ese DPI.');
  }
}

export class DatosDeResidenciaRequeridos extends PilotosError {
  constructor() {
    super(
      'DATOS_DE_RESIDENCIA_REQUERIDOS',
      'REGLA_NEGOCIO',
      'Falta la dirección de residencia del piloto.',
      [{ campo: 'direccionResidencia', mensajes: ['Escribe la dirección de residencia.'] }],
    );
  }
}

export class HistorialEducativoRequerido extends PilotosError {
  constructor() {
    super(
      'HISTORIAL_EDUCATIVO_REQUERIDO',
      'REGLA_NEGOCIO',
      'Falta el historial educativo del piloto.',
      [{ campo: 'historialEducativo', mensajes: ['Escribe el historial educativo.'] }],
    );
  }
}

export class DatosDeComunicacionRequeridos extends PilotosError {
  constructor() {
    super('DATOS_DE_COMUNICACION_REQUERIDOS', 'REGLA_NEGOCIO', 'Falta el teléfono del piloto.', [
      { campo: 'telefono', mensajes: ['Escribe un teléfono de contacto.'] },
    ]);
  }
}

export class TelefonoInvalido extends PilotosError {
  constructor() {
    super(
      'TELEFONO_INVALIDO',
      'REGLA_NEGOCIO',
      'El teléfono tiene 8 dígitos, por ejemplo 5555-1234. Revísalo y vuelve a escribirlo.',
      [{ campo: 'telefono', mensajes: ['El teléfono debe tener 8 dígitos.'] }],
    );
  }
}

export class CorreoInvalido extends PilotosError {
  constructor() {
    super(
      'CORREO_INVALIDO',
      'REGLA_NEGOCIO',
      'El correo no tiene forma de correo, por ejemplo nombre@dominio.com.',
      [{ campo: 'correo', mensajes: ['Escribe un correo válido.'] }],
    );
  }
}

export class BusDePilotoDeBaja extends PilotosError {
  constructor() {
    super(
      'BUS_DE_BAJA',
      'REGLA_NEGOCIO',
      'El bus está de baja y no puede recibir pilotos. Elige otro bus.',
      [{ campo: 'busId', mensajes: ['El bus está de baja.'] }],
    );
  }
}

/** El bus indicado como dato de entrada no existe. */
export class BusDePilotoNoExiste extends PilotosError {
  constructor() {
    super('BUS_NO_EXISTE', 'REGLA_NEGOCIO', 'El bus indicado no existe. Elige un bus registrado.', [
      { campo: 'busId', mensajes: ['El bus no existe.'] },
    ]);
  }
}

export class PilotoNoExiste extends PilotosError {
  constructor() {
    super('PILOTO_NO_EXISTE', 'NO_ENCONTRADO', 'El piloto no existe.');
  }
}
