'use client';

import { useActionState, type ReactElement } from 'react';
import { BotonEnviar } from '@/shared/components/acciones';
import { ResumenErrores } from '@/shared/components/formulario';
import { TextoOculto } from '@/shared/components/utilidades';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { atenderAlerta } from '../actions/atender-alerta';

type Propiedades = Readonly<{ alertaId: number; placa: string }>;

/** Marca una alerta pendiente como atendida; el error del backend se muestra tal cual. */
export function AtenderAlerta({ alertaId, placa }: Propiedades): ReactElement {
  const [resultado, enviar] = useActionState(
    (_anterior: EstadoDeAccion | null): Promise<EstadoDeAccion> => atenderAlerta(alertaId),
    null,
  );
  return (
    <form action={enviar} className="flex flex-col gap-2 whitespace-normal">
      {resultado && !resultado.ok ? <ResumenErrores mensaje={resultado.error.mensaje} /> : null}
      <BotonEnviar variante="secundario" tamano="denso">
        Atender<TextoOculto> {`alerta del bus ${placa}`}</TextoOculto>
      </BotonEnviar>
    </form>
  );
}
