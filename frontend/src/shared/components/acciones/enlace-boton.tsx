import Link, { type LinkProps } from 'next/link';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { ContenidoBoton, type PropiedadesContenido } from './contenido-boton';
import {
  BASE_BOTON,
  TAMANOS_BOTON,
  VARIANTES_BOTON,
  type TamanoBoton,
  type VarianteBoton,
} from './estilos-boton';

type Propiedades = Omit<PropiedadesContenido, 'cargando'> &
  Readonly<{
    href: LinkProps['href'];
    variante: VarianteBoton;
    tamano?: TamanoBoton;
    className?: string;
  }>;

/** Enlace con aspecto de botón: para navegar, nunca un botón con manejador de clic. */
export function EnlaceBoton({
  href,
  variante,
  tamano = 'normal',
  icono,
  posicionIcono,
  className,
  children,
}: Propiedades): ReactElement {
  return (
    <Link
      href={href}
      className={cn(BASE_BOTON, VARIANTES_BOTON[variante], TAMANOS_BOTON[tamano], className)}
    >
      <ContenidoBoton icono={icono} posicionIcono={posicionIcono}>
        {children}
      </ContenidoBoton>
    </Link>
  );
}
