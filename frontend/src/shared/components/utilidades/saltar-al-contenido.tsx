import type { ReactElement } from 'react';

type Propiedades = Readonly<{ destino?: string }>;

/** Primer elemento enfocable de cada página: lleva al contenido principal sin recorrer la navegación. */
export function SaltarAlContenido({ destino = '#contenido' }: Propiedades): ReactElement {
  return (
    <a
      href={destino}
      className="sr-only rounded-full bg-primary px-5 py-3 text-label text-ink-inverse focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      Saltar al contenido
    </a>
  );
}
