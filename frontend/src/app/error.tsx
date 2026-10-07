'use client';

import type { ReactElement } from 'react';

interface PropiedadesDeError {
  error: Error & { digest?: string };
  reset: () => void;
}

// No se muestra el mensaje del error: puede contener detalles internos.
export default function ErrorDeSegmento({ reset }: PropiedadesDeError): ReactElement {
  return (
    <main id="contenido" className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 role="alert" className="text-2xl font-bold text-danger">
        Algo salió mal
      </h1>
      <p className="text-ink-muted">No se pudo mostrar esta página. Intenta de nuevo.</p>
      <button
        type="button"
        onClick={reset}
        className="w-fit rounded-md bg-primary px-4 py-2 font-semibold text-surface hover:bg-primary-strong focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Reintentar
      </button>
    </main>
  );
}
