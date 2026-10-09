import { AccesosError } from './businessError';

/** La estación indicada para un acceso nuevo no existe. */
export class EstacionDeAccesoNoExiste extends AccesosError {
  constructor() {
    super(
      'ESTACION_NO_EXISTE',
      'REGLA_NEGOCIO',
      'La estación indicada no existe. Elige una estación registrada.',
      [{ campo: 'estacionId', mensajes: ['La estación no existe.'] }],
    );
  }
}

/** La estación pedida por su id no existe. */
export class EstacionNoExiste extends AccesosError {
  constructor() {
    super('ESTACION_NO_EXISTE', 'NO_ENCONTRADO', 'La estación no existe.');
  }
}

export class CodigoAccesoDuplicado extends AccesosError {
  constructor(codigo: string) {
    super(
      'CODIGO_ACCESO_DUPLICADO',
      'CONFLICTO',
      `Ya existe el acceso ${codigo} en esta estación. Usa otro código.`,
    );
  }
}

/** Se intentó registrar un acceso sin indicar su primer guardia. */
export class AccesoSinGuardia extends AccesosError {
  constructor() {
    super(
      'ACCESO_SIN_GUARDIA',
      'REGLA_NEGOCIO',
      'Todo acceso necesita al menos un guardia. Elige el guardia y su turno para registrar el acceso.',
      [{ campo: 'guardiaId', mensajes: ['Elige un guardia.'] }],
    );
  }
}

/** Se intentó quitar la última asignación de un acceso. */
export class UltimaAsignacionDelAcceso extends AccesosError {
  constructor() {
    super(
      'ACCESO_SIN_GUARDIA',
      'REGLA_NEGOCIO',
      'Todo acceso necesita al menos un guardia. Asigna otro guardia antes de quitar este.',
    );
  }
}

export class DpiInvalido extends AccesosError {
  constructor() {
    super(
      'DPI_INVALIDO',
      'REGLA_NEGOCIO',
      'El DPI tiene 13 dígitos. Revísalo y vuelve a escribirlo.',
      [{ campo: 'dpi', mensajes: ['El DPI debe tener 13 dígitos.'] }],
    );
  }
}

export class TelefonoInvalido extends AccesosError {
  constructor() {
    super(
      'TELEFONO_INVALIDO',
      'REGLA_NEGOCIO',
      'El teléfono tiene 8 dígitos, por ejemplo 5555-1234. Revísalo y vuelve a escribirlo.',
      [{ campo: 'telefono', mensajes: ['El teléfono debe tener 8 dígitos.'] }],
    );
  }
}

export class DpiGuardiaDuplicado extends AccesosError {
  constructor() {
    super(
      'DPI_GUARDIA_DUPLICADO',
      'CONFLICTO',
      'Ya hay un guardia con ese DPI. Revisa el número o edita al guardia existente.',
    );
  }
}

export class TurnoInvalido extends AccesosError {
  constructor() {
    super(
      'TURNO_INVALIDO',
      'REGLA_NEGOCIO',
      'Escribe el turno como 06:00-14:00, con horas de 00:00 a 23:59 y un fin distinto del inicio.',
      [{ campo: 'turno', mensajes: ['Turno con formato inválido.'] }],
    );
  }
}

export class AsignacionDuplicada extends AccesosError {
  constructor() {
    super('ASIGNACION_DUPLICADA', 'CONFLICTO', 'El guardia ya cubre este acceso en ese turno.');
  }
}

export class TurnoTraslapado extends AccesosError {
  constructor(turno: string, estacion: string) {
    super(
      'TURNO_TRASLAPADO',
      'REGLA_NEGOCIO',
      `El guardia ya tiene el turno ${turno} en la estación ${estacion}. Elige otro turno u otro guardia.`,
      [{ campo: 'turno', mensajes: [`Se traslapa con ${turno} en ${estacion}.`] }],
    );
  }
}

export class AccesoNoExiste extends AccesosError {
  constructor() {
    super('ACCESO_NO_EXISTE', 'NO_ENCONTRADO', 'El acceso no existe.');
  }
}

/** El guardia pedido por su id no existe. */
export class GuardiaNoExiste extends AccesosError {
  constructor() {
    super('GUARDIA_NO_EXISTE', 'NO_ENCONTRADO', 'El guardia no existe.');
  }
}

/** El guardia indicado en una asignación no existe. */
export class GuardiaAsignadoNoExiste extends AccesosError {
  constructor() {
    super(
      'GUARDIA_NO_EXISTE',
      'REGLA_NEGOCIO',
      'El guardia indicado no existe. Elige un guardia registrado.',
      [{ campo: 'guardiaId', mensajes: ['El guardia no existe.'] }],
    );
  }
}

export class AsignacionNoExiste extends AccesosError {
  constructor() {
    super('ASIGNACION_NO_EXISTE', 'NO_ENCONTRADO', 'El guardia no cubre ese acceso en ese turno.');
  }
}

export class LineaNoExiste extends AccesosError {
  constructor() {
    super('LINEA_NO_EXISTE', 'NO_ENCONTRADO', 'La línea no existe.');
  }
}
