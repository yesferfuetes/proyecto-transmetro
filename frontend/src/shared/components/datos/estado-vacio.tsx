import type { ReactElement, ReactNode } from 'react';
import { Icono, type NombreIcono } from '@/shared/components/utilidades';

type Variante = 'sin-datos' | 'sin-resultados' | 'error-de-carga';

const ICONO: Record<Variante, NombreIcono> = {
  'sin-datos': 'bandeja-vacia',
  'sin-resultados': 'sin-resultados',
  'error-de-carga': 'sin-conexion',
};

type Propiedades = Readonly<{
  variante: Variante;
  titulo: string;
  texto: string;
  accion?: ReactNode;
}>;

/** Mensaje centrado cuando una vista no tiene nada que mostrar. */
export function EstadoVacio({ variante, titulo, texto, accion }: Propiedades): ReactElement {
  return (
    <div
      role={variante === 'error-de-carga' ? 'alert' : undefined}
      className="flex flex-col items-center gap-3 px-4 py-10 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icono nombre={ICONO[variante]} tamano={28} />
      </span>
      <h2 className="text-subheading text-ink">{titulo}</h2>
      <p className="max-w-md text-body text-ink-muted">{texto}</p>
      {accion ? <div className="mt-2">{accion}</div> : null}
    </div>
  );
}
