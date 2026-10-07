import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type Propiedades = Readonly<{
  variante?: 'pagina' | 'compacta';
  etiqueta: string;
  children: ReactNode;
}>;

/**
 * Plano oscuro con el dato más importante de la pantalla. En móvil, la variante de página ocupa el
 * ancho completo; en escritorio queda dentro del contenido con las cuatro esquinas redondeadas.
 */
export function FranjaSuperior({
  variante = 'pagina',
  etiqueta,
  children,
}: Propiedades): ReactElement {
  return (
    <section
      aria-label={etiqueta}
      className={cn(
        'bg-night text-ink-inverse',
        variante === 'pagina'
          ? '-mx-gutter -mt-6 rounded-b-xl px-gutter pt-6 pb-8 lg:mx-0 lg:mt-0 lg:rounded-xl lg:p-8'
          : 'rounded-xl p-6',
      )}
    >
      {children}
    </section>
  );
}
