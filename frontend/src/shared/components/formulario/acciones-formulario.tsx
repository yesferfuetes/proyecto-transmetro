import type { ReactElement, ReactNode } from 'react';

type Propiedades = Readonly<{ children: ReactNode }>;

/** Pie del formulario. En móvil queda fijo sobre la navegación; el principal va a la derecha. */
export function AccionesFormulario({ children }: Propiedades): ReactElement {
  return (
    <div className="sticky bottom-nav-bar -mx-gutter flex flex-col-reverse gap-3 border-t border-border bg-canvas px-gutter py-3 sm:flex-row sm:justify-end lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0">
      {children}
    </div>
  );
}
