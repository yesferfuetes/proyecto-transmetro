import type { ReactElement } from 'react';
import { Esqueleto } from '@/shared/components/datos';

export default function CargandoInicio(): ReactElement {
  return (
    <div className="flex flex-col gap-section">
      <div className="-mx-gutter -mt-6 rounded-b-xl bg-night px-gutter py-8 lg:mx-0 lg:mt-0 lg:rounded-xl lg:p-8">
        <Esqueleto forma="cifra" />
      </div>
      <Esqueleto forma="mosaico" cantidad={6} />
      <Esqueleto forma="fila" cantidad={5} />
    </div>
  );
}
