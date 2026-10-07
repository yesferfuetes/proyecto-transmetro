import type { ReactElement, ReactNode } from 'react';

type Propiedades = Readonly<{ children: ReactNode }>;

/** Texto que solo leen los lectores de pantalla. */
export function TextoOculto({ children }: Propiedades): ReactElement {
  return <span className="sr-only">{children}</span>;
}
