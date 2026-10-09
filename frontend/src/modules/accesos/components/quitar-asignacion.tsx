'use client';

import { useState, type ReactElement } from 'react';
import { BotonIcono } from '@/shared/components/acciones';
import { ResumenErrores } from '@/shared/components/formulario';
import { Dialogo } from '@/shared/components/superposiciones';
import { quitarAsignacion } from '../actions/quitar-asignacion';
import { useEnvio } from '../hooks/use-envio';

type Propiedades = Readonly<{
  accesoId: number;
  guardiaId: number;
  guardiaNombre: string;
  turno: string;
}>;

/** Quita a un guardia de un turno, tras confirmar; si el backend lo rechaza, muestra su mensaje. */
export function QuitarAsignacion({
  accesoId,
  guardiaId,
  guardiaNombre,
  turno,
}: Propiedades): ReactElement {
  const [abierto, setAbierto] = useState(false);
  const { error, enviar, reiniciar } = useEnvio(
    () => quitarAsignacion(accesoId, { guardiaId, turno }),
    () => setAbierto(false),
  );
  const cerrar = (): void => {
    setAbierto(false);
    reiniciar();
  };
  const etiqueta = `Quitar a ${guardiaNombre} del turno ${turno}`;

  return (
    <>
      <BotonIcono icono="cerrar" etiqueta={etiqueta} onClick={() => setAbierto(true)} />
      <Dialogo
        abierto={abierto}
        alCerrar={cerrar}
        titulo={`¿Quitar a ${guardiaNombre} del turno ${turno}?`}
        variante="destructivo"
        confirmacion={{ texto: 'Quitar del turno', alConfirmar: () => enviar(undefined) }}
      >
        {error ? <ResumenErrores mensaje={error.mensaje} /> : null}
        <p className="text-body text-ink-muted">
          El guardia deja de cubrir este acceso en ese turno. Esto no se puede deshacer.
        </p>
      </Dialogo>
    </>
  );
}
