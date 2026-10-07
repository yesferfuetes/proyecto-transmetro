import type { ReactElement, ReactNode } from 'react';
import { Icono } from '@/shared/components/utilidades';

export type AtributosControl = Readonly<{
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}>;

type Propiedades = Readonly<{
  id: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  opcional?: boolean;
  /** Recibe los atributos que asocian el control con su etiqueta, su ayuda y su error. */
  children: (control: AtributosControl) => ReactNode;
}>;

/** Etiqueta encima, control, ayuda y error debajo. Lo obligatorio es la norma. */
export function Campo({
  id,
  etiqueta,
  ayuda,
  error,
  opcional = false,
  children,
}: Propiedades): ReactElement {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const descripcion = [idAyuda, idError].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label text-ink">
        {opcional ? (
          <>
            {etiqueta} <span className="font-normal text-ink-muted">(opcional)</span>
          </>
        ) : (
          etiqueta
        )}
      </label>
      {children({
        id,
        'aria-describedby': descripcion,
        'aria-invalid': error ? true : undefined,
      })}
      {ayuda ? (
        <p id={idAyuda} className="text-dense text-ink-muted">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={idError} className="flex items-start gap-1.5 text-dense text-danger">
          <Icono nombre="error" tamano={16} className="mt-0.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
