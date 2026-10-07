import type { ButtonHTMLAttributes, ReactElement } from 'react';
import { Icono, type NombreIcono } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';
import { VARIANTES_BOTON_ICONO } from './estilos-boton';

type Propiedades = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> &
  Readonly<{
    icono: NombreIcono;
    /** Nombre accesible: obligatorio porque el botón no tiene texto visible. */
    etiqueta: string;
    variante?: keyof typeof VARIANTES_BOTON_ICONO;
  }>;

/** Botón circular de solo ícono. */
export function BotonIcono({
  icono,
  etiqueta,
  variante = 'fantasma',
  className,
  type = 'button',
  ...atributos
}: Propiedades): ReactElement {
  return (
    <button
      type={type}
      aria-label={etiqueta}
      className={cn(
        'inline-flex size-control items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-safe:transition-colors',
        VARIANTES_BOTON_ICONO[variante],
        className,
      )}
      {...atributos}
    >
      <Icono nombre={icono} />
    </button>
  );
}
