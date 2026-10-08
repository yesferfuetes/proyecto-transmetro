'use client';

import { useActionState, type ReactElement } from 'react';
import { BotonEnviar } from '@/shared/components/acciones';
import { Campo, ResumenErrores, Selector } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { cambiarEstadoDeLinea } from '../actions/cambiar-estado-de-linea';
import { ETIQUETA_DE_ESTADO, esquemaEstadoLinea, type EstadoLinea } from '../schemas/comunes';

const ESTADOS = esquemaEstadoLinea.options.map((estado) => ({
  valor: estado,
  etiqueta: ETIQUETA_DE_ESTADO[estado],
}));

type Propiedades = Readonly<{ lineaId: number; estado: EstadoLinea }>;

/** Cambia el estado de una línea; si el backend lo rechaza, muestra su mensaje tal cual. */
export function CambioDeEstadoLinea({ lineaId, estado }: Propiedades): ReactElement {
  const [resultado, enviar] = useActionState(
    (_anterior: EstadoDeAccion | null, formulario: FormData): Promise<EstadoDeAccion> =>
      cambiarEstadoDeLinea(lineaId, { estado: formulario.get('estado') }),
    null,
  );
  return (
    <form action={enviar} className="flex flex-col gap-4">
      {resultado && !resultado.ok ? <ResumenErrores mensaje={resultado.error.mensaje} /> : null}
      {resultado?.ok ? <Aviso estado="exito" titulo="Estado actualizado." /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-64">
          <Campo id="estado-linea" etiqueta="Estado de la línea">
            {(control) => (
              <Selector {...control} name="estado" defaultValue={estado} opciones={ESTADOS} />
            )}
          </Campo>
        </div>
        <BotonEnviar variante="secundario">Cambiar estado</BotonEnviar>
      </div>
    </form>
  );
}
