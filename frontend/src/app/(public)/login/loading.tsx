import type { ReactElement } from 'react';
import { Esqueleto } from '@/shared/components/datos';

export default function CargandoInicioDeSesion(): ReactElement {
  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-canvas px-gutter py-section focus:outline-none"
    >
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <Esqueleto forma="texto" />
        <Esqueleto forma="fila" cantidad={3} />
      </div>
    </main>
  );
}
