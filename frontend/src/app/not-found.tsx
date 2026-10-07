import Link from 'next/link';
import type { ReactElement } from 'react';

export default function NoEncontrada(): ReactElement {
  return (
    <main id="contenido" className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-heading font-bold text-ink">Página no encontrada</h1>
      <p className="text-ink-muted">La dirección que buscas no existe.</p>
      <Link
        href="/"
        className="w-fit font-semibold text-primary underline hover:text-primary-strong focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        Volver a la portada
      </Link>
    </main>
  );
}
