import { z } from 'zod';
import { esquemaIdOpcional, esquemaNumeroDePagina, esquemaPagina } from './comunes';
import { esquemaFiltrosAplicados, esquemaTipoDeReporte } from './consulta';

export const esquemaConstancia = z.object({
  id: z.number().int().positive(),
  usuario: z.object({
    id: z.number().int().positive(),
    nombre: z.string(),
    correo: z.string(),
  }),
  tipo: esquemaTipoDeReporte,
  filtros: esquemaFiltrosAplicados,
  fechaHora: z.string(),
});
export type Constancia = z.infer<typeof esquemaConstancia>;

export const esquemaPaginaDeBitacora = esquemaPagina(esquemaConstancia);
export type PaginaDeBitacora = z.infer<typeof esquemaPaginaDeBitacora>;

/** Día escrito como AAAA-MM-DD; lo que no tiene esa forma se ignora. */
const esquemaDia = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined);

/** Filtros de la bitácora tal como llegan en la URL; lo que no sirve se ignora. */
export const esquemaFiltrosDeBitacora = z.object({
  usuarioId: esquemaIdOpcional,
  tipo: esquemaTipoDeReporte.optional().catch(undefined),
  desde: esquemaDia,
  hasta: esquemaDia,
  pagina: esquemaNumeroDePagina,
});
export type FiltrosDeBitacora = z.infer<typeof esquemaFiltrosDeBitacora>;
