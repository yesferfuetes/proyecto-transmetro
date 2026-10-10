import type { ReactElement, TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { CONTROL } from './estilos-campo';

type Propiedades = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** Campo de varias líneas con el aspecto del sistema; crece en vertical, nunca en horizontal. */
export function CampoArea({ rows = 4, className, ...atributos }: Propiedades): ReactElement {
  return (
    <textarea
      rows={rows}
      className={cn(CONTROL, 'h-auto min-h-control resize-y py-2', className)}
      {...atributos}
    />
  );
}
