'use client';

import { useActionState, type ReactElement } from 'react';
import { BotonEnviar } from '@/shared/components/acciones';
import { Campo, ResumenErrores, Selector, type Opcion } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { cambiarParqueo } from '../actions/cambiar-parqueo';

type Propiedades = Readonly<{
  busId: number;
  parqueoId: number;
  parqueos: readonly Opcion[];
}>;

/** Cambia el bus a otro parqueo; no existe la opción de dejarlo sin parqueo. */
export function CambioDeParqueo({ busId, parqueoId, parqueos }: Propiedades): ReactElement {
  const [resultado, enviar] = useActionState(
    (_anterior: EstadoDeAccion | null, formulario: FormData): Promise<EstadoDeAccion> =>
      cambiarParqueo(busId, { parqueoId: formulario.get('parqueoId') }),
    null,
  );
  return (
    <form action={enviar} className="flex flex-col gap-4">
      {resultado && !resultado.ok ? <ResumenErrores mensaje={resultado.error.mensaje} /> : null}
      {resultado?.ok ? <Aviso estado="exito" titulo="Parqueo actualizado." /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-96">
          <Campo id="parqueo-del-bus" etiqueta="Parqueo del bus">
            {(control) => (
              <Selector
                {...control}
                name="parqueoId"
                defaultValue={String(parqueoId)}
                opciones={parqueos}
              />
            )}
          </Campo>
        </div>
        <BotonEnviar variante="secundario">Cambiar parqueo</BotonEnviar>
      </div>
    </form>
  );
}
