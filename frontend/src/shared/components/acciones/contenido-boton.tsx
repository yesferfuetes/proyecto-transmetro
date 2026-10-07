import type { ReactElement, ReactNode } from 'react';
import { Icono, type NombreIcono } from '@/shared/components/utilidades';

export type PropiedadesContenido = Readonly<{
  icono?: NombreIcono;
  posicionIcono?: 'inicio' | 'fin';
  cargando?: boolean;
  children: ReactNode;
}>;

/** Ícono y texto de un botón; mientras carga, el ícono gira y el texto se mantiene. */
export function ContenidoBoton({
  icono,
  posicionIcono = 'inicio',
  cargando = false,
  children,
}: PropiedadesContenido): ReactElement {
  const nombre = cargando ? 'cargando' : icono;
  const elemento = nombre ? (
    <Icono nombre={nombre} className={cargando ? 'motion-safe:animate-spin' : undefined} />
  ) : null;
  return (
    <>
      {posicionIcono === 'inicio' ? elemento : null}
      <span>{children}</span>
      {posicionIcono === 'fin' ? elemento : null}
    </>
  );
}
