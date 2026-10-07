import type { ReactElement, SelectHTMLAttributes } from 'react';
import { Icono } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';
import { CONTROL } from './estilos-campo';

export type Opcion = Readonly<{ valor: string; etiqueta: string }>;

type Propiedades = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> &
  Readonly<{ opciones: readonly Opcion[]; textoVacio?: string }>;

/** Lista nativa con el aspecto de campo. */
export function Selector({
  opciones,
  textoVacio,
  className,
  ...atributos
}: Propiedades): ReactElement {
  return (
    <span className="relative flex items-center">
      <select className={cn(CONTROL, 'appearance-none pe-10', className)} {...atributos}>
        {textoVacio ? <option value="">{textoVacio}</option> : null}
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
      <Icono nombre="chevron-abajo" className="pointer-events-none absolute end-3 text-ink-muted" />
    </span>
  );
}
