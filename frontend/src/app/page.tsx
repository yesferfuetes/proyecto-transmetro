import type { ReactElement } from 'react';

// Estático: no depende de sesión ni de datos.
export const dynamic = 'force-static';

export default function Portada(): ReactElement {
  return (
    <main id="contenido" className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-title font-bold text-primary">Transmetro</h1>
      <p className="text-body text-ink-muted">
        Sistema de Información y Control Operativo de la Municipalidad de Guatemala.
      </p>
    </main>
  );
}
