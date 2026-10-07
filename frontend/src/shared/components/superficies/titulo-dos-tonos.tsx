import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import type { Tono } from '@/shared/types/diseno';

type Propiedades = Readonly<{
  nivel: 1 | 2;
  destacado: string;
  resto: string;
  /** Si la palabra destacada va antes o después del resto. */
  orden?: 'destacado-primero' | 'destacado-ultimo';
  tono?: Tono;
  id?: string;
}>;

/** Título con una palabra en el color de acento: azul sobre claro, verde sobre oscuro. */
export function TituloDosTonos({
  nivel,
  destacado,
  resto,
  orden = 'destacado-primero',
  tono = 'claro',
  id,
}: Propiedades): ReactElement {
  const Encabezado = nivel === 1 ? 'h1' : 'h2';
  const palabra = (
    <span className={tono === 'claro' ? 'text-primary' : 'text-accent'}>{destacado}</span>
  );
  return (
    <Encabezado
      id={id}
      className={cn(
        nivel === 1 ? 'text-title lg:text-title-lg' : 'text-heading',
        tono === 'claro' ? 'text-ink' : 'text-ink-inverse',
      )}
    >
      {orden === 'destacado-primero' ? (
        <>
          {palabra} {resto}
        </>
      ) : (
        <>
          {resto} {palabra}
        </>
      )}
    </Encabezado>
  );
}
