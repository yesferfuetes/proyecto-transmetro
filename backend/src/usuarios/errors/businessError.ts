import { ErrorDeNegocio, TipoDeError } from '../../shared/errors/error-de-negocio';

interface DefinicionDeError {
  tipo: TipoDeError;
  mensaje: string;
}

/** Códigos de dominio del módulo usuarios, con su clasificación y el mensaje para la persona. */
export const ERRORES_DE_USUARIOS = {
  CREDENCIALES_INVALIDAS: {
    tipo: 'NO_AUTORIZADO',
    mensaje: 'El correo o la contraseña no son correctos.',
  },
  USUARIO_INACTIVO: {
    tipo: 'NO_AUTORIZADO',
    mensaje: 'Tu usuario está desactivado. Acude al administrador del sistema.',
  },
  NO_AUTENTICADO: {
    tipo: 'NO_AUTORIZADO',
    mensaje: 'Debes iniciar sesión para continuar.',
  },
  SESION_EXPIRADA: {
    tipo: 'NO_AUTORIZADO',
    mensaje: 'Tu sesión terminó. Inicia sesión de nuevo.',
  },
  ACCESO_DENEGADO: {
    tipo: 'PROHIBIDO',
    mensaje: 'Tu rol no tiene permiso para esta acción.',
  },
  ROL_INVALIDO: {
    tipo: 'REGLA_NEGOCIO',
    mensaje: 'El rol debe ser operador de estación, supervisor municipal o administrador.',
  },
  OPERADOR_SIN_ESTACION: {
    tipo: 'REGLA_NEGOCIO',
    mensaje: 'Un operador de estación necesita una estación asignada.',
  },
  ESTACION_NO_EXISTE: {
    tipo: 'REGLA_NEGOCIO',
    mensaje: 'La estación elegida no existe.',
  },
  ESTACION_NO_APLICA: {
    tipo: 'REGLA_NEGOCIO',
    mensaje: 'Solo un operador de estación lleva estación asignada. Quita la estación.',
  },
  EMAIL_DUPLICADO: {
    tipo: 'CONFLICTO',
    mensaje: 'Ya existe un usuario con ese correo.',
  },
  CONTRASENA_DEBIL: {
    tipo: 'REGLA_NEGOCIO',
    mensaje: 'La contraseña debe tener al menos 8 caracteres, con al menos una letra y un número.',
  },
  ULTIMO_ADMINISTRADOR: {
    tipo: 'REGLA_NEGOCIO',
    mensaje: 'Debe quedar al menos un administrador activo.',
  },
  AUTODESACTIVACION_NO_PERMITIDA: {
    tipo: 'REGLA_NEGOCIO',
    mensaje: 'No puedes desactivar tu propio usuario.',
  },
  USUARIO_NO_EXISTE: {
    tipo: 'NO_ENCONTRADO',
    mensaje: 'El usuario no existe.',
  },
} as const satisfies Record<string, DefinicionDeError>;

export type CodigoDeUsuarios = keyof typeof ERRORES_DE_USUARIOS;

/** Error de negocio del módulo usuarios. El código determina su tipo y su mensaje. */
export class UsuariosError extends ErrorDeNegocio {
  constructor(codigo: CodigoDeUsuarios) {
    const { tipo, mensaje } = ERRORES_DE_USUARIOS[codigo];
    super(codigo, tipo, mensaje);
  }
}
