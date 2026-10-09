import { z } from 'zod';

const MENSAJE_TURNO = 'Escribe el turno como 06:00-14:00.';

/** Cortesía de forma: la hora de inicio y la de fin, separadas por un guion. El backend decide. */
export const esquemaTurno = z
  .string({ error: MENSAJE_TURNO })
  .trim()
  .regex(/^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/, MENSAJE_TURNO);

/** Guardia elegido en una lista: el valor vacío significa que falta. */
export const esquemaGuardiaElegido = z.coerce
  .number({ error: 'Elige un guardia.' })
  .int('Elige un guardia.')
  .positive('Elige un guardia.');

/** Estación elegida en una lista: el valor vacío significa que falta. */
export const esquemaEstacionElegida = z.coerce
  .number({ error: 'Elige una estación.' })
  .int('Elige una estación.')
  .positive('Elige una estación.');
