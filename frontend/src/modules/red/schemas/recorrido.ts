import { z } from 'zod';

const esquemaParada = z.object({
  estacionId: z.number().int().positive(),
  distanciaSiguienteKm: z
    .number({ error: 'Escribe la distancia en kilómetros.' })
    .positive('La distancia debe ser mayor que 0.')
    .max(999.999, 'La distancia no puede pasar de 999.999 km.')
    .nullable(),
});

type Parada = z.infer<typeof esquemaParada>;

function revisarParadas(paradas: readonly Parada[], contexto: z.RefinementCtx): void {
  const vistas = new Set<number>();
  paradas.forEach((parada, indice) => {
    if (vistas.has(parada.estacionId)) {
      contexto.addIssue({
        code: 'custom',
        path: [indice, 'estacionId'],
        message: 'La estación ya está en el recorrido.',
      });
    }
    vistas.add(parada.estacionId);
    const esUltima = indice === paradas.length - 1;
    if (!esUltima && parada.distanciaSiguienteKm === null) {
      contexto.addIssue({
        code: 'custom',
        path: [indice, 'distanciaSiguienteKm'],
        message: 'Escribe la distancia a la siguiente estación.',
      });
    }
  });
}

export const esquemaFormularioRecorrido = z.object({
  paradas: z.array(esquemaParada).max(200).superRefine(revisarParadas),
});

export type FormularioRecorrido = z.infer<typeof esquemaFormularioRecorrido>;
