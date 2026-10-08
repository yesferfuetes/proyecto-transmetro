import type { ReactElement } from 'react';
import { Esqueleto } from '@/shared/components/datos';

export default function CargandoUsuarios(): ReactElement {
  return (
    <div className="flex flex-col gap-section">
      <Esqueleto forma="texto" />
      <Esqueleto forma="fila" cantidad={8} />
    </div>
  );
}
