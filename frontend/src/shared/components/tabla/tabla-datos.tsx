import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { ARIA_SORT, EncabezadoOrdenable, type Orden } from './encabezado-ordenable';

export type Columna<T> = Readonly<{
  clave: string;
  encabezado: string;
  celda: (fila: T) => ReactNode;
  alineacion?: 'inicio' | 'fin';
  /** Queda fija al desplazar la tabla en pantallas pequeñas. */
  fija?: boolean;
  ordenable?: Readonly<{ href: string; orden: Orden }>;
}>;

type Propiedades<T> = Readonly<{
  id: string;
  titulo: string;
  tituloVisible?: boolean;
  columnas: readonly Columna<T>[];
  filas: readonly T[];
  claveDeFila: (fila: T) => string;
  seleccionada?: (fila: T) => boolean;
  /** Lo que se muestra cuando no hay filas, normalmente un EstadoVacio. */
  vacio: ReactNode;
}>;

function clasesDeCelda<T>(columna: Columna<T>): string {
  return cn(
    'px-4',
    columna.alineacion === 'fin' ? 'text-right tabular-nums' : 'text-left',
    columna.fija ? 'sticky left-0 bg-inherit' : null,
  );
}

function Encabezado<T>({ columna }: Readonly<{ columna: Columna<T> }>): ReactElement {
  const orden = columna.ordenable?.orden ?? null;
  return (
    <th
      scope="col"
      aria-sort={orden ? ARIA_SORT[orden] : undefined}
      className={cn(clasesDeCelda(columna), 'py-3 text-eyebrow text-ink-muted uppercase')}
    >
      {columna.ordenable ? (
        <EncabezadoOrdenable etiqueta={columna.encabezado} {...columna.ordenable} />
      ) : (
        columna.encabezado
      )}
    </th>
  );
}

/** Tabla densa dentro de una tarjeta; se desplaza en su propia región en pantallas pequeñas. */
export function TablaDatos<T>({
  id,
  titulo,
  tituloVisible = false,
  columnas,
  filas,
  claveDeFila,
  seleccionada,
  vacio,
}: Propiedades<T>): ReactElement {
  const idTitulo = `${id}-titulo`;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {filas.length === 0 ? (
        vacio
      ) : (
        <div
          role="region"
          aria-labelledby={idTitulo}
          tabIndex={0}
          className="overflow-x-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
        >
          <table id={id} className="w-full border-collapse text-dense text-ink">
            <caption
              id={idTitulo}
              className={tituloVisible ? 'px-4 pt-4 text-left text-subheading text-ink' : 'sr-only'}
            >
              {titulo}
            </caption>
            <thead className="sticky top-0 bg-canvas">
              <tr>
                {columnas.map((columna) => (
                  <Encabezado key={columna.clave} columna={columna} />
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr
                  key={claveDeFila(fila)}
                  className={cn(
                    'h-row border-t border-border',
                    seleccionada?.(fila) ? 'bg-primary-soft' : 'bg-surface hover:bg-neutral-50',
                  )}
                >
                  {columnas.map((columna) => (
                    <td key={columna.clave} className={cn(clasesDeCelda(columna), 'py-2')}>
                      {columna.celda(fila)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
