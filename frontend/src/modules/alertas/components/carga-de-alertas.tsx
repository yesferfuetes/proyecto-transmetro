import type { ReactElement } from 'react';
import { Esqueleto } from '@/shared/components/datos';

/** Espera de la lista o del registro: título y filas. */
export function CargaDeAlertas(): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <Esqueleto forma="texto" />
      <Esqueleto forma="fila" cantidad={6} />
    </div>
  );
}
