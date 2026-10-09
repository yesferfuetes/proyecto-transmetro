'use client';

import { useActionState, type ReactElement } from 'react';
import { BotonEnviar } from '@/shared/components/acciones';
import { Campo, ResumenErrores, Selector, type Opcion } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { asignarLinea } from '../actions/asignar-linea';

type Propiedades = Readonly<{
  busId: number;
  /** Línea actual del bus, o `null` si no tiene. */
  lineaId: number | null;
  lineas: readonly Opcion[];
}>;

/** Asigna el bus a otra línea o lo deja sin línea; muestra el error del backend tal cual. */
export function CambioDeLinea({ busId, lineaId, lineas }: Propiedades): ReactElement {
  const [resultado, enviar] = useActionState(
    (_anterior: EstadoDeAccion | null, formulario: FormData): Promise<EstadoDeAccion> =>
      asignarLinea(busId, { lineaId: formulario.get('lineaId') }),
    null,
  );
  return (
    <form action={enviar} className="flex flex-col gap-4">
      {resultado && !resultado.ok ? <ResumenErrores mensaje={resultado.error.mensaje} /> : null}
      {resultado?.ok ? <Aviso estado="exito" titulo="Línea actualizada." /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-96">
          <Campo id="linea-del-bus" etiqueta="Línea del bus">
            {(control) => (
              <Selector
                {...control}
                name="lineaId"
                defaultValue={lineaId === null ? '' : String(lineaId)}
                opciones={lineas}
                textoVacio="Sin línea"
              />
            )}
          </Campo>
        </div>
        <BotonEnviar variante="secundario">Cambiar línea</BotonEnviar>
      </div>
    </form>
  );
}
