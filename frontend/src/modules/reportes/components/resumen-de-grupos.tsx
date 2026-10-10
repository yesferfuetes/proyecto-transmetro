import type { ReactElement } from 'react';
import { PuntoLinea } from '@/shared/components/datos';
import { Tarjeta } from '@/shared/components/superficies';
import type { GrupoDeBuses } from '../schemas/reportes';

type Propiedades = Readonly<{ grupos: readonly GrupoDeBuses[] }>;

/** Cuántos buses tiene cada línea en todo el reporte, no solo en la página que se ve. */
export function ResumenDeGrupos({ grupos }: Propiedades): ReactElement | null {
  if (grupos.length === 0) {
    return null;
  }
  return (
    <Tarjeta variante="densa" como="section">
      <h2 className="mb-2 text-label text-ink">Buses por línea</h2>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-dense">
        {grupos.map((grupo) => (
          <li key={grupo.linea?.id ?? 'sin-linea'} className="flex items-center gap-2">
            {grupo.linea ? (
              <PuntoLinea codigo={grupo.linea.codigo} nombre={grupo.linea.nombre} />
            ) : (
              <span>Sin línea</span>
            )}
            <span className="text-ink-muted tabular-nums">
              · {grupo.buses} {grupo.buses === 1 ? 'bus' : 'buses'}
            </span>
          </li>
        ))}
      </ul>
    </Tarjeta>
  );
}
