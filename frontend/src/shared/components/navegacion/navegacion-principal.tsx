import type { ReactElement } from 'react';
import { ChipEstado } from '@/shared/components/datos';
import { particionarNavegacion, type Destino } from './destinos';
import { EnlaceNavegacion } from './enlace-navegacion';
import { HojaMas } from './hoja-mas';

type Propiedades = Readonly<{
  /** Destinos ya filtrados por el rol de la sesión. */
  destinos: readonly Destino[];
  usuario: Readonly<{ nombre: string; rol: string }>;
}>;

/**
 * Navegación principal con el mismo lenguaje en dos formas: barra lateral desde `lg` y píldora
 * flotante inferior en pantallas menores.
 */
export function NavegacionPrincipal({ destinos, usuario }: Propiedades): ReactElement {
  const { visibles, mas } = particionarNavegacion(destinos);
  return (
    <>
      <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:shrink-0 lg:p-gutter">
        <nav
          aria-label="Principal"
          className="flex h-full w-sidebar flex-col gap-6 rounded-xl border border-border bg-surface p-4"
        >
          <p className="flex flex-col px-4 pt-2">
            <span className="text-heading text-ink">Transmetro</span>
            <span className="text-dense text-ink-muted">Municipalidad de Guatemala</span>
          </p>
          <ul className="flex flex-col gap-1">
            {destinos.map((destino) => (
              <li key={destino.href}>
                <EnlaceNavegacion destino={destino} forma="lateral" />
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col items-start gap-2 border-t border-border px-4 pt-4">
            <span className="text-label text-ink">{usuario.nombre}</span>
            <ChipEstado estado="neutro" icono="usuarios">
              {usuario.rol}
            </ChipEstado>
          </div>
        </nav>
      </aside>
      <nav aria-label="Principal" className="fixed inset-x-gutter bottom-gutter z-40 lg:hidden">
        <ul className="flex h-nav-bar items-center justify-around rounded-full border border-border bg-surface px-2 shadow-float">
          {visibles.map((destino) => (
            <li key={destino.href}>
              <EnlaceNavegacion destino={destino} forma="inferior" />
            </li>
          ))}
          {mas.length > 0 ? (
            <li>
              <HojaMas destinos={mas} />
            </li>
          ) : null}
        </ul>
      </nav>
    </>
  );
}
