import { z } from 'zod';
import { esquemaRol } from '@/shared/schemas/sesion';

// Estas reglas son una cortesía para corregir antes de enviar: el backend vuelve a validar y su
// mensaje es el que se muestra.

export const esquemaContrasena = z
  .string()
  .min(8, 'La contraseña necesita al menos 8 caracteres.')
  .max(128, 'La contraseña admite hasta 128 caracteres.')
  .regex(/\p{L}/u, 'La contraseña necesita al menos una letra.')
  .regex(/\d/, 'La contraseña necesita al menos un número.');

const camposDeUsuario = {
  nombre: z
    .string()
    .trim()
    .min(1, 'Escribe el nombre.')
    .max(150, 'El nombre admite hasta 150 caracteres.'),
  correo: z
    .email('Escribe un correo válido, por ejemplo ana@muni.gt.')
    .max(150, 'El correo admite hasta 150 caracteres.'),
  rol: z.enum(esquemaRol.options, 'Elige un rol.'),
  estacionId: z.number().int().positive().nullable().optional(),
};

function exigirEstacionAlOperador(
  datos: Readonly<{ rol: string; estacionId?: number | null }>,
  contexto: z.RefinementCtx,
): void {
  if (datos.rol === 'OPERADOR_ESTACION' && (datos.estacionId ?? null) === null) {
    contexto.addIssue({
      code: 'custom',
      path: ['estacionId'],
      message: 'Elige la estación del operador.',
    });
  }
}

export const esquemaEdicionUsuario = z
  .object(camposDeUsuario)
  .superRefine(exigirEstacionAlOperador);
export type EdicionUsuario = z.infer<typeof esquemaEdicionUsuario>;

export const esquemaRegistroUsuario = z
  .object({ ...camposDeUsuario, contrasena: esquemaContrasena })
  .superRefine(exigirEstacionAlOperador);
export type RegistroUsuario = z.infer<typeof esquemaRegistroUsuario>;

export const esquemaAsignacionContrasena = z
  .object({ contrasena: esquemaContrasena, confirmacion: z.string() })
  .refine((datos) => datos.contrasena === datos.confirmacion, {
    path: ['confirmacion'],
    message: 'Las dos contraseñas no coinciden.',
  });
export type AsignacionContrasena = z.infer<typeof esquemaAsignacionContrasena>;

export const esquemaCambioDeContrasena = z
  .object({
    contrasenaActual: z
      .string()
      .min(1, 'Escribe tu contraseña actual.')
      .max(128, 'La contraseña admite hasta 128 caracteres.'),
    contrasenaNueva: esquemaContrasena,
    confirmacion: z.string(),
  })
  .refine((datos) => datos.contrasenaNueva === datos.confirmacion, {
    path: ['confirmacion'],
    message: 'Las dos contraseñas nuevas no coinciden.',
  });
export type CambioDeContrasena = z.infer<typeof esquemaCambioDeContrasena>;
