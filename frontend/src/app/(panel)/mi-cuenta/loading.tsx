import type { ReactElement } from 'react';
import { Esqueleto } from '@/shared/components/datos';

export default function CargandoMiCuenta(): ReactElement {
  return (
    <div className="flex flex-col gap-section">
      <Esqueleto forma="texto" />
      <Esqueleto forma="fila" cantidad={4} />
    </div>
  );
}
