import type { ButtonHTMLAttributes, ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { ContenidoBoton, type PropiedadesContenido } from './contenido-boton';
import {
  BASE_BOTON,
  TAMANOS_BOTON,
  VARIANTES_BOTON,
  type TamanoBoton,
  type VarianteBoton,
} from './estilos-boton';

export type PropiedadesBoton = PropiedadesContenido &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  Readonly<{ variante: VarianteBoton; tamano?: TamanoBoton }>;

/** Botón en forma de píldora. Un solo `principal` por vista o diálogo. */
export function Boton({
  variante,
  tamano = 'normal',
  icono,
  posicionIcono,
  cargando = false,
  className,
  type = 'button',
  children,
  ...atributos
}: PropiedadesBoton): ReactElement {
  return (
    <button
      type={type}
      aria-busy={cargando || undefined}
      aria-disabled={cargando || undefined}
      className={cn(BASE_BOTON, VARIANTES_BOTON[variante], TAMANOS_BOTON[tamano], className)}
      {...atributos}
    >
      <ContenidoBoton icono={icono} posicionIcono={posicionIcono} cargando={cargando}>
        {children}
      </ContenidoBoton>
    </button>
  );
}
