import type { ReactElement } from 'react';
import { PuntoLinea } from '@/shared/components/datos';
import type { FiltrosAplicados } from '../schemas/consulta';

type Propiedades = Readonly<{ filtros: FiltrosAplicados }>;

/** Los filtros de una consulta con sus nombres; la línea, con el punto de su color. */
export function FiltrosAplicadosDeLaConsulta({ filtros }: Propiedades): ReactElement {
  const { linea, estacion, municipalidad } = filtros;
  if (!linea && !estacion && !municipalidad) {
    return <span className="text-ink-muted">Sin filtros</span>;
  }
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {linea ? (
        <li>
          Línea:{' '}
          {linea.codigo ? <PuntoLinea codigo={linea.codigo} nombre={linea.nombre} /> : linea.nombre}
        </li>
      ) : null}
      {estacion ? <li>Estación: {estacion.nombre}</li> : null}
      {municipalidad ? <li>Municipalidad: {municipalidad.nombre}</li> : null}
    </ul>
  );
}
