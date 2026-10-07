import type { ReactElement } from 'react';
import { Icono } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';
import { FILTRO_INACTIVO, PILDORA_FILTRO } from './estilos-filtro';

type Propiedades = Readonly<{ nombre: string; etiqueta: string; valor?: string }>;

/** Campo de búsqueda en píldora; se envía con Enter. */
export function FiltroBusqueda({ nombre, etiqueta, valor }: Propiedades): ReactElement {
  return (
    <span className={cn(PILDORA_FILTRO, FILTRO_INACTIVO, 'min-w-56')}>
      <Icono nombre="buscar" tamano={16} />
      <input
        type="search"
        name={nombre}
        aria-label={etiqueta}
        placeholder={etiqueta}
        defaultValue={valor}
        className="w-full bg-transparent text-dense text-ink placeholder:text-ink-muted focus:outline-none"
      />
    </span>
  );
}
