import { z } from 'zod';
import { esquemaReferencia } from './comunes';

const MENSAJE_BUS = 'Elige un bus.';
const MENSAJE_PASAJEROS = 'Escribe los pasajeros como un número entero desde 0.';

/** El campo vacío no es cero: se rechaza antes de convertirlo. */
const esquemaPasajeros = z.preprocess(
  (valor) => (valor === '' || valor === null ? undefined : valor),
  z.coerce
    .number({ error: MENSAJE_PASAJEROS })
    .int(MENSAJE_PASAJEROS)
    .nonnegative(MENSAJE_PASAJEROS),
);

export const esquemaFormularioDeLectura = z.object({
  busId: z.coerce.number({ error: MENSAJE_BUS }).int(MENSAJE_BUS).positive(MENSAJE_BUS),
  pasajeros: esquemaPasajeros,
});
export type FormularioDeLectura = z.output<typeof esquemaFormularioDeLectura>;

/** Respuesta del registro: `null` cuando la lectura no genera alerta. */
export const esquemaAlertaCreada = z.object({
  alertaId: z.number().int().positive().nullable(),
});

export const esquemaBusParaLectura = z.object({
  id: z.number().int().positive(),
  placa: z.string(),
  capacidadMax: z.number().int().positive(),
  linea: esquemaReferencia,
});
export type BusParaLectura = z.infer<typeof esquemaBusParaLectura>;

export const esquemaBusesParaLectura = z.array(esquemaBusParaLectura);
