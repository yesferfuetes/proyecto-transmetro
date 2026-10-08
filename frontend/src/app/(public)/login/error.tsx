'use client';

import type { ReactElement } from 'react';
import { Boton } from '@/shared/components/acciones';
import { EstadoVacio } from '@/shared/components/datos';

// Next.js también entrega `error`; no se usa porque su mensaje puede contener detalles internos.
type Propiedades = Readonly<{ reset: () => void }>;

export default function ErrorDeInicioDeSesion({ reset }: Propiedades): ReactElement {
  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-canvas px-gutter py-section focus:outline-none"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface">
        <EstadoVacio
          variante="error-de-carga"
          titulo="No se pudo abrir el inicio de sesión"
          texto="El servidor no respondió. Revisa la conexión e intenta de nuevo."
          accion={
            <Boton variante="secundario" onClick={reset}>
              Reintentar
            </Boton>
          }
        />
      </div>
    </main>
  );
}
