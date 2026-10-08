import { z } from 'zod';

export const esquemaRol = z.enum(['OPERADOR_ESTACION', 'SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR']);

export type Rol = z.infer<typeof esquemaRol>;

/** Usuario de la sesión tal como lo devuelve el backend en su cuenta. */
export const esquemaSesion = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
  correo: z.string(),
  rol: esquemaRol,
  estacion: z
    .object({ id: z.number().int().positive(), codigo: z.string(), nombre: z.string() })
    .nullable(),
});

export type Sesion = z.infer<typeof esquemaSesion>;

export const ETIQUETA_DE_ROL: Readonly<Record<Rol, string>> = {
  OPERADOR_ESTACION: 'Operador de estación',
  SUPERVISOR_MUNICIPAL: 'Supervisor municipal',
  ADMINISTRADOR: 'Administrador',
};
