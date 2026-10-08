'use client';

import type { ReactElement } from 'react';
import { Boton } from '@/shared/components/acciones';
import { EstadoVacio } from '@/shared/components/datos';

// Next.js también entrega `error`; no se usa porque su mensaje puede contener detalles internos.
type Propiedades = Readonly<{ reset: () => void }>;

export default function ErrorDeMiCuenta({ reset }: Propiedades): ReactElement {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <EstadoVacio
        variante="error-de-carga"
        titulo="No se pudo cargar tu cuenta"
        texto="Revisa la conexión e intenta de nuevo."
        accion={
          <Boton variante="secundario" onClick={reset}>
            Reintentar
          </Boton>
        }
      />
    </div>
  );
}
