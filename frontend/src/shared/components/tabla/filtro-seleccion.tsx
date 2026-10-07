'use client';

import type { ChangeEvent, ReactElement } from 'react';
import { Icono } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';
import { FILTRO_ACTIVO, FILTRO_INACTIVO, PILDORA_FILTRO } from './estilos-filtro';

export type OpcionFiltro = Readonly<{ valor: string; etiqueta: string }>;

type Propiedades = Readonly<{
  nombre: string;
  etiqueta: string;
  opciones: readonly OpcionFiltro[];
  valor?: string;
  etiquetaTodas?: string;
}>;

function enviarFormulario(evento: ChangeEvent<HTMLSelectElement>): void {
  evento.currentTarget.form?.requestSubmit();
}

/** Píldora con una lista nativa: al elegir, envía el formulario de filtros. */
export function FiltroSeleccion({
  nombre,
  etiqueta,
  opciones,
  valor = '',
  etiquetaTodas = 'Todas',
}: Propiedades): ReactElement {
  const activo = valor !== '';
  return (
    <span className={cn(PILDORA_FILTRO, 'relative pe-9', activo ? FILTRO_ACTIVO : FILTRO_INACTIVO)}>
      <span aria-hidden="true">{etiqueta}:</span>
      <select
        name={nombre}
        aria-label={etiqueta}
        defaultValue={valor}
        onChange={enviarFormulario}
        className="cursor-pointer appearance-none bg-transparent text-label focus:outline-none"
      >
        <option value="">{etiquetaTodas}</option>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      <Icono nombre="chevron-abajo" tamano={16} className="pointer-events-none absolute end-3" />
    </span>
  );
}
