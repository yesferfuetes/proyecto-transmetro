import type { ReactElement } from 'react';
import { InsigniaLinea } from '@/shared/components/datos';
import type { Referencia } from '../schemas/comunes';

type Propiedades = Readonly<{ linea: Referencia | null; tamano?: 'chico' | 'mediano' }>;

/** Línea del piloto con la insignia de su color, o "Sin línea". */
export function LineaDelPiloto({ linea, tamano = 'chico' }: Propiedades): ReactElement {
  if (linea === null) {
    return <span className="text-ink-muted">Sin línea</span>;
  }
  return (
    <span className="flex items-center gap-3">
      <InsigniaLinea codigo={linea.codigo} tamano={tamano} />
      <span>{linea.nombre}</span>
    </span>
  );
}
