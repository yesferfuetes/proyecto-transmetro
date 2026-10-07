import type { ReactElement } from 'react';
import { TextoOculto } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';

type Forma = 'texto' | 'cifra' | 'fila' | 'mosaico';

const FORMAS: Record<Forma, string> = {
  texto: 'h-4 w-48 rounded-full',
  cifra: 'h-14 w-24 rounded-lg',
  fila: 'h-row w-full rounded-md',
  mosaico: 'size-tile rounded-lg',
};

const CLAVES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

type Propiedades = Readonly<{ forma: Forma; cantidad?: number; className?: string }>;

/** Bloques de espera para las vistas que cargan. Anuncia "Cargando…" una vez. */
export function Esqueleto({ forma, cantidad = 1, className }: Propiedades): ReactElement {
  return (
    <div role="status" className={cn('flex flex-wrap gap-3', className)}>
      <TextoOculto>Cargando…</TextoOculto>
      {CLAVES.slice(0, cantidad).map((clave) => (
        <span
          key={clave}
          aria-hidden="true"
          className={cn('bg-neutral-200 motion-safe:animate-pulse', FORMAS[forma])}
        />
      ))}
    </div>
  );
}
