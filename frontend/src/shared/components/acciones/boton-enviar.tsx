'use client';

import type { ReactElement } from 'react';
import { useFormStatus } from 'react-dom';
import { Boton, type PropiedadesBoton } from './boton';

type Propiedades = Omit<PropiedadesBoton, 'type' | 'cargando'>;

/** Botón de envío que muestra el estado de carga mientras la acción del formulario se ejecuta. */
export function BotonEnviar({ disabled, ...propiedades }: Propiedades): ReactElement {
  const { pending: pendiente } = useFormStatus();
  return (
    <Boton {...propiedades} type="submit" cargando={pendiente} disabled={disabled ?? pendiente} />
  );
}
