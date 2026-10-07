'use client';

import { useEffect, useId, useRef, type ReactElement, type ReactNode } from 'react';
import { BotonIcono } from '@/shared/components/acciones';
import { cn } from '@/shared/lib/cn';

export type PropiedadesModal = Readonly<{
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: ReactNode;
  pie?: ReactNode;
}>;

const POSICION = {
  centro: 'm-auto max-w-dialog rounded-xl max-md:mb-0 max-md:max-w-none max-md:rounded-b-none',
  abajo: 'mx-auto mt-auto mb-0 max-w-dialog rounded-t-xl',
} as const;

/**
 * `<dialog>` nativo en modo modal: atrapa el foco, cierra con Esc y devuelve el foco al disparador.
 * La apertura la decide el padre; el efecto solo sincroniza el elemento del navegador.
 */
export function ModalNativo({
  abierto,
  alCerrar,
  titulo,
  children,
  pie,
  posicion,
}: PropiedadesModal & Readonly<{ posicion: keyof typeof POSICION }>): ReactElement {
  const referencia = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = referencia.current;
    if (abierto && !dialogo?.open) {
      dialogo?.showModal();
    } else if (!abierto && dialogo?.open) {
      dialogo.close();
    }
  }, [abierto]);

  return (
    <dialog
      ref={referencia}
      aria-labelledby={idTitulo}
      onClose={alCerrar}
      className={cn(
        'w-full bg-surface p-6 text-ink shadow-dialog backdrop:bg-night/60',
        POSICION[posicion],
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={idTitulo} className="text-subheading">
          {titulo}
        </h2>
        <BotonIcono icono="cerrar" etiqueta="Cerrar" onClick={alCerrar} className="-me-2 -mt-2" />
      </div>
      <div className="mt-4">{children}</div>
      {pie ? (
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{pie}</div>
      ) : null}
    </dialog>
  );
}
