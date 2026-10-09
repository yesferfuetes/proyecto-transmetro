'use client';

import type { ReactElement } from 'react';
import type { Opcion } from '@/shared/components/formulario';
import { EdicionDeNombreDeAcceso } from './edicion-de-nombre-de-acceso';
import { RegistroDeAcceso } from './registro-de-acceso';

type Propiedades = Readonly<{
  /** Con un acceso existente solo se cambia su nombre; sin él se registra uno nuevo. */
  acceso?: Readonly<{ id: number; nombre: string | null }>;
  estaciones?: readonly Opcion[];
  guardias?: readonly Opcion[];
  /** Estación con la que arranca el registro, por ejemplo la que se venía consultando. */
  estacionInicialId?: string;
}>;

/** Registrar un acceso con su primer guardia, o cambiar el nombre de uno existente. */
export function FormularioAcceso({
  acceso,
  estaciones = [],
  guardias = [],
  estacionInicialId,
}: Propiedades): ReactElement {
  return acceso ? (
    <EdicionDeNombreDeAcceso accesoId={acceso.id} nombre={acceso.nombre} />
  ) : (
    <RegistroDeAcceso
      estaciones={estaciones}
      guardias={guardias}
      estacionInicialId={estacionInicialId}
    />
  );
}
