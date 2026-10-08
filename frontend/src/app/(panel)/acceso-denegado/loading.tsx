import type { ReactElement } from 'react';
import { Esqueleto } from '@/shared/components/datos';

export default function CargandoAccesoDenegado(): ReactElement {
  return (
    <div className="flex flex-col gap-section">
      <Esqueleto forma="texto" />
      <Esqueleto forma="fila" cantidad={2} />
    </div>
  );
}
