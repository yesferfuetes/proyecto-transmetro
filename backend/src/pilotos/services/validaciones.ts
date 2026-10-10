import {
  CorreoInvalido,
  DatosDeComunicacionRequeridos,
  DatosDeResidenciaRequeridos,
  DpiInvalido,
  HistorialEducativoRequerido,
  NombreInvalido,
  TelefonoInvalido,
} from '../errors/errores-de-pilotos';
import {
  normalizarCorreo,
  normalizarDpi,
  normalizarTelefono,
  recortar,
  recortarONulo,
} from './normalizacion';

export interface DatosDePiloto {
  nombre: string;
  dpi: string;
  direccionResidencia: string;
  telefono: string;
  correo: string | null;
  historialEducativo: string;
}

const LARGO_MAXIMO_DEL_NOMBRE = 150;

function validarNombre(texto: string): string {
  const nombre = recortar(texto);
  if (nombre === '' || nombre.length > LARGO_MAXIMO_DEL_NOMBRE) {
    throw new NombreInvalido();
  }
  return nombre;
}

function validarDpi(texto: string): string {
  const dpi = normalizarDpi(texto);
  if (dpi === null) {
    throw new DpiInvalido();
  }
  return dpi;
}

function validarTelefono(texto: string): string {
  const recortado = recortarONulo(texto);
  if (recortado === null) {
    throw new DatosDeComunicacionRequeridos();
  }
  const telefono = normalizarTelefono(recortado);
  if (telefono === null) {
    throw new TelefonoInvalido();
  }
  return telefono;
}

function validarCorreo(texto: string | null): string | null {
  const recortado = recortarONulo(texto);
  if (recortado === null) {
    return null;
  }
  const correo = normalizarCorreo(recortado);
  if (correo === null) {
    throw new CorreoInvalido();
  }
  return correo;
}

/**
 * Valida y normaliza el expediente en este orden: nombre, DPI, dirección, historial, teléfono y
 * correo. Lanza la primera violación.
 */
export function validarExpediente(datos: DatosDePiloto): DatosDePiloto {
  const nombre = validarNombre(datos.nombre);
  const dpi = validarDpi(datos.dpi);
  const direccionResidencia = recortarONulo(datos.direccionResidencia);
  if (direccionResidencia === null) {
    throw new DatosDeResidenciaRequeridos();
  }
  const historialEducativo = recortarONulo(datos.historialEducativo);
  if (historialEducativo === null) {
    throw new HistorialEducativoRequerido();
  }
  const telefono = validarTelefono(datos.telefono);
  const correo = validarCorreo(datos.correo);
  return { nombre, dpi, direccionResidencia, telefono, correo, historialEducativo };
}
