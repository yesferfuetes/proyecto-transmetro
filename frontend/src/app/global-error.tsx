'use client';

import type { ReactElement } from 'react';
import './globals.css';

// Next.js también entrega `error`; no se usa porque su mensaje puede contener detalles internos.
type PropiedadesDeError = Readonly<{ reset: () => void }>;

// Reemplaza al layout raíz cuando falla: declara su propio documento.
export default function ErrorGlobal({ reset }: PropiedadesDeError): ReactElement {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans antialiased">
        <main id="contenido" className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
          <h1 role="alert" className="text-2xl font-bold text-danger">
            Algo salió mal
          </h1>
          <p className="text-ink-muted">La aplicación no pudo cargarse. Intenta de nuevo.</p>
          <button
            type="button"
            onClick={reset}
            className="w-fit rounded-md bg-primary px-4 py-2 font-semibold text-surface hover:bg-primary-strong focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
