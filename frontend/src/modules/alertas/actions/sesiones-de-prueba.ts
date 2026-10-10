import type { Resultado } from '@/shared/lib/http/resultado';
import type { Rol, Sesion } from '@/shared/schemas/sesion';

/** Cuenta de la sesión con el rol indicado, como la devuelve el backend. */
export function sesionDe(rol: Rol): Resultado<Sesion> {
  return {
    ok: true,
    datos: {
      id: 1,
      nombre: 'Persona de prueba',
      correo: 'prueba@transmetro.test',
      rol,
      estacion: rol === 'OPERADOR_ESTACION' ? { id: 3, codigo: 'E3', nombre: 'Trébol' } : null,
    },
  };
}

export function errorDelBackend(codigo: string, estado = 422): Resultado<never> {
  return { ok: false, error: { codigo, mensaje: `Mensaje de ${codigo}`, detalles: [], estado } };
}
