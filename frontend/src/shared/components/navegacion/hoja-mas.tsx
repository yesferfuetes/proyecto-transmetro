'use client';

import { useState, type ReactElement } from 'react';
import { Hoja } from '@/shared/components/superposiciones';
import { Icono } from '@/shared/components/utilidades';
import type { Destino } from './destinos';
import { EnlaceNavegacion } from './enlace-navegacion';

type Propiedades = Readonly<{ destinos: readonly Destino[] }>;

/** Botón "Más" de la barra inferior: abre una hoja con los destinos que no caben. */
export function HojaMas({ destinos }: Propiedades): ReactElement {
  const [abierta, setAbierta] = useState(false);
  const cerrar = (): void => setAbierta(false);
  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setAbierta(true)}
        className="flex min-w-14 flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-eyebrow text-ink-muted hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Icono nombre="mas" tamano={24} />
        Más
      </button>
      <Hoja abierto={abierta} alCerrar={cerrar} titulo="Más opciones">
        <ul className="flex flex-col gap-1">
          {destinos.map((destino) => (
            <li key={destino.href}>
              <EnlaceNavegacion destino={destino} forma="lateral" alNavegar={cerrar} />
            </li>
          ))}
        </ul>
      </Hoja>
    </>
  );
}
