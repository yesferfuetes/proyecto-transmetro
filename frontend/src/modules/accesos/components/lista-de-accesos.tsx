import Link from 'next/link';
import type { ReactElement } from 'react';
import { ChipEstado } from '@/shared/components/datos';
import type { AccesoResumen } from '../schemas/acceso';
import { rotuloDeAcceso, textoDeGuardias } from './presentacion';

type Propiedades = Readonly<{
  accesos: readonly AccesoResumen[];
  /** Nombre de la estación, para el nombre accesible de la lista. */
  estacion: string;
}>;

/** Accesos de una estación como enlaces a su detalle; sin accesos, lo dice con una marca. */
export function ListaDeAccesos({ accesos, estacion }: Propiedades): ReactElement {
  if (accesos.length === 0) {
    return <ChipEstado estado="advertencia">Sin accesos</ChipEstado>;
  }
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label={`Accesos de ${estacion}`}>
      {accesos.map((acceso) => (
        <li key={acceso.id}>
          <Link
            href={`/accesos/${acceso.id}`}
            className="rounded-sm text-label text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            {rotuloDeAcceso(acceso.codigo, acceso.nombre)} ({textoDeGuardias(acceso.guardias)})
          </Link>
        </li>
      ))}
    </ul>
  );
}
