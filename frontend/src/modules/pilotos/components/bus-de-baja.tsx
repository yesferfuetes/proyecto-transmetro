import type { ReactElement } from 'react';
import { ChipEstado } from '@/shared/components/datos';

/** Aviso en la fila y en la ficha de un piloto cuyo bus se dio de baja. */
export function BusDeBaja(): ReactElement {
  return <ChipEstado estado="advertencia">Bus de baja</ChipEstado>;
}
