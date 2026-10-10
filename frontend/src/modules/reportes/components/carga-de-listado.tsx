import type { ReactElement } from 'react';
import { Esqueleto } from '@/shared/components/datos';

/** Espera de un reporte, de la bitácora o del formulario: título y filas. */
export function CargaDeListado(): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <Esqueleto forma="texto" />
      <Esqueleto forma="fila" cantidad={6} />
    </div>
  );
}
