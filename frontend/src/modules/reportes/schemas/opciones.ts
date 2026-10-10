import { z } from 'zod';
import { esquemaReferenciaConNombre, esquemaReferenciaDeLinea } from './comunes';

export const esquemaOpciones = z.object({
  lineas: z.array(esquemaReferenciaDeLinea),
  estaciones: z.array(
    z.object({ id: z.number().int().positive(), codigo: z.string(), nombre: z.string() }),
  ),
  municipalidades: z.array(esquemaReferenciaConNombre),
  usuarios: z.array(
    z.object({ id: z.number().int().positive(), nombre: z.string(), correo: z.string() }),
  ),
});
export type OpcionesDeReporte = z.infer<typeof esquemaOpciones>;

export const esquemaArchivo = z.object({
  nombreDeArchivo: z.string().min(1),
  contenido: z.string(),
});
export type Archivo = z.infer<typeof esquemaArchivo>;
