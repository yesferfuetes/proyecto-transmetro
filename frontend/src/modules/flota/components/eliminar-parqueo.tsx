'use client';

import { useState, type ReactElement } from 'react';
import { Boton } from '@/shared/components/acciones';
import { Aviso, Dialogo } from '@/shared/components/superposiciones';
import { TextoOculto } from '@/shared/components/utilidades';
import { eliminarParqueo } from '../actions/eliminar-parqueo';
import { useEnvio } from '../hooks/use-envio';

type Propiedades = Readonly<{ id: number; codigo: string; estacion: string }>;

/** Elimina un parqueo vacío tras confirmarlo; si el backend lo rechaza, muestra su mensaje. */
export function EliminarParqueo({ id, codigo, estacion }: Propiedades): ReactElement {
  const [abierto, setAbierto] = useState(false);
  const { error, enviar } = useEnvio(() => eliminarParqueo(id));
  return (
    <>
      <Boton variante="fantasma" tamano="denso" onClick={() => setAbierto(true)}>
        Eliminar<TextoOculto> {`parqueo ${codigo} de ${estacion}`}</TextoOculto>
      </Boton>
      <Dialogo
        variante="destructivo"
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        titulo={`¿Eliminar el parqueo ${codigo} de ${estacion}?`}
        confirmacion={{ texto: 'Eliminar parqueo', alConfirmar: () => enviar(undefined) }}
      >
        <div className="flex flex-col gap-3">
          <p>Solo se elimina un parqueo que no guarda buses. Esta acción no se puede deshacer.</p>
          {error ? <Aviso estado="error" titulo={error.mensaje} /> : null}
        </div>
      </Dialogo>
    </>
  );
}
