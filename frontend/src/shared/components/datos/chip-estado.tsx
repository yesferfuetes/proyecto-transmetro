import type { ReactElement, ReactNode } from 'react';
import { Icono, type NombreIcono } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';
import type { Estado, Tono } from '@/shared/types/diseno';

const ICONO_DE_ESTADO: Record<Estado, NombreIcono> = {
  error: 'error',
  advertencia: 'advertencia',
  exito: 'exito',
  informacion: 'informacion',
  neutro: 'circulo',
};

const CLASES: Record<Tono, Record<Estado, string>> = {
  claro: {
    error: 'bg-danger-soft text-danger-strong',
    advertencia: 'bg-warning-soft text-warning-strong',
    exito: 'bg-success-soft text-success-strong',
    informacion: 'bg-primary-soft text-primary',
    neutro: 'bg-canvas text-ink-muted',
  },
  oscuro: {
    error: 'bg-night-raised text-danger-on-night',
    advertencia: 'bg-night-raised text-warning-on-night',
    exito: 'bg-night-raised text-success-on-night',
    informacion: 'bg-night-raised text-ink-inverse-muted',
    neutro: 'bg-night-raised text-ink-inverse',
  },
};

type Propiedades = Readonly<{
  estado: Estado;
  tono?: Tono;
  icono?: NombreIcono;
  children: ReactNode;
}>;

/** Píldora de estado: siempre con ícono y texto, nunca solo color. */
export function ChipEstado({ estado, tono = 'claro', icono, children }: Propiedades): ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label whitespace-nowrap',
        CLASES[tono][estado],
      )}
    >
      <Icono nombre={icono ?? ICONO_DE_ESTADO[estado]} tamano={16} />
      {children}
    </span>
  );
}
