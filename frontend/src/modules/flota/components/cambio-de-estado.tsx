'use client';

import { useActionState, type ReactElement } from 'react';
import { BotonEnviar } from '@/shared/components/acciones';
import { Campo, ResumenErrores, Selector } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { cambiarEstado } from '../actions/cambiar-estado';
import { esquemaEstadoDeBus, ETIQUETA_DE_ESTADO_DE_BUS, type EstadoDeBus } from '../schemas/bus';

const ESTADOS = esquemaEstadoDeBus.options.map((estado) => ({
  valor: estado,
  etiqueta: ETIQUETA_DE_ESTADO_DE_BUS[estado],
}));

type Propiedades = Readonly<{ busId: number; estado: EstadoDeBus }>;

/** Cambia el estado del bus; dar de baja es definitivo y le quita la línea. */
export function CambioDeEstado({ busId, estado }: Propiedades): ReactElement {
  const [resultado, enviar] = useActionState(
    (_anterior: EstadoDeAccion | null, formulario: FormData): Promise<EstadoDeAccion> =>
      cambiarEstado(busId, { estado: formulario.get('estado') }),
    null,
  );
  return (
    <form action={enviar} className="flex flex-col gap-4">
      {resultado && !resultado.ok ? <ResumenErrores mensaje={resultado.error.mensaje} /> : null}
      {resultado?.ok ? <Aviso estado="exito" titulo="Estado actualizado." /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-64">
          <Campo
            id="estado-del-bus"
            etiqueta="Estado del bus"
            ayuda="La baja es definitiva y le quita la línea al bus."
          >
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
