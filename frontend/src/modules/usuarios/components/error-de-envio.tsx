import type { ReactElement } from 'react';
import { ResumenErrores } from '@/shared/components/formulario';
import type { EstadoDeEnvio } from '../hooks/use-envio';
import { errorDelEnvio, erroresDeCampo } from './errores-de-envio';

type Propiedades = Readonly<{ estado: EstadoDeEnvio; prefijo: string }>;

/** Mensaje del backend tal cual; cada intento fallido vuelve a llevar el foco al resumen. */
export function ErrorDeEnvio({ estado, prefijo }: Propiedades): ReactElement | null {
  const error = errorDelEnvio(estado);
  if (error === null) {
    return null;
  }
  return (
    <ResumenErrores
      key={estado.intento}
      mensaje={error.mensaje}
      errores={erroresDeCampo(error, prefijo)}
    />
  );
}
