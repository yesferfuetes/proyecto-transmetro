import { z } from 'zod';
import { cantidadEntera, elegido } from './comunes';

export const esquemaParqueo = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  capacidadVehiculos: z.number().int().positive(),
  buses: z.number().int().nonnegative(),
  estacion: z.object({
    id: z.number().int().positive(),
    codigo: z.string(),
    nombre: z.string(),
  }),
});
export type Parqueo = z.infer<typeof esquemaParqueo>;

export const esquemaParqueos = z.array(esquemaParqueo);

export const esquemaFormularioParqueo = z.object({
  estacionId: elegido('Elige una estación.'),
  codigo: z
    .string({ error: 'Escribe el código.' })
    .trim()
    .min(1, 'Escribe el código.')
    .max(10, 'Usa como máximo 10 caracteres.'),
  capacidadVehiculos: cantidadEntera('Escribe la capacidad como un número entero.'),
});
export type FormularioParqueo = z.output<typeof esquemaFormularioParqueo>;

/** Al editar solo cambia la capacidad. */
export const esquemaEdicionDeParqueo = esquemaFormularioParqueo.pick({ capacidadVehiculos: true });
export type EdicionDeParqueo = z.output<typeof esquemaEdicionDeParqueo>;
