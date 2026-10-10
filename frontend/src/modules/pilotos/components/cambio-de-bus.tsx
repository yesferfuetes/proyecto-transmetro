'use client';

import { useActionState, type ReactElement } from 'react';
import { BotonEnviar } from '@/shared/components/acciones';
import { Campo, ResumenErrores, Selector, type Opcion } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { cambiarBusDePiloto } from '../actions/cambiar-bus-de-piloto';

type Propiedades = Readonly<{
  pilotoId: number;
  /** Bus actual del piloto, o `null` si no tiene. */
  busId: number | null;
  buses: readonly Opcion[];
}>;

/** Asigna el piloto a otro bus o lo deja sin bus; muestra el error del backend tal cual. */
export function CambioDeBus({ pilotoId, busId, buses }: Propiedades): ReactElement {
  const [resultado, enviar] = useActionState(
    (_anterior: EstadoDeAccion | null, formulario: FormData): Promise<EstadoDeAccion> =>
      cambiarBusDePiloto(pilotoId, { busId: formulario.get('busId') }),
    null,
  );
  return (
    <form action={enviar} className="flex flex-col gap-4">
      {resultado && !resultado.ok ? <ResumenErrores mensaje={resultado.error.mensaje} /> : null}
      {resultado?.ok ? <Aviso estado="exito" titulo="Bus actualizado." /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-96">
          <Campo id="bus-del-piloto" etiqueta="Bus del piloto">
            {(control) => (
              <Selector
                {...control}
                name="busId"
                defaultValue={busId === null ? '' : String(busId)}
                opciones={buses}
                textoVacio="Sin bus"
              />
            )}
          </Campo>
        </div>
        <BotonEnviar variante="secundario">Cambiar bus</BotonEnviar>
      </div>
    </form>
  );
}
