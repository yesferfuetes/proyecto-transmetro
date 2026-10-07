'use client';

import type { ReactElement } from 'react';
import { useAvisos } from '@/shared/hooks/use-avisos';
import { AvisoEfimero } from './aviso-efimero';

/** Región viva única donde aparecen los avisos efímeros. Se monta una vez en el layout. */
export function RegionAvisos(): ReactElement {
  const avisos = useAvisos((estado) => estado.avisos);
  const quitar = useAvisos((estado) => estado.quitar);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-gutter top-4 z-50 flex flex-col items-center gap-2 lg:inset-x-auto lg:top-auto lg:right-8 lg:bottom-8 lg:items-end"
    >
      {avisos.map((aviso) => (
        <div key={aviso.id} className="pointer-events-auto">
          <AvisoEfimero aviso={aviso} alCerrar={quitar} />
        </div>
      ))}
    </div>
  );
}
