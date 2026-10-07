import type { ReactElement, ReactNode } from 'react';
import { Icono, type NombreIcono } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';

type EstadoAviso = 'informacion' | 'exito' | 'advertencia' | 'error';

const ESTILOS: Record<EstadoAviso, { clases: string; icono: NombreIcono }> = {
  informacion: { clases: 'border-l-primary bg-primary-soft text-primary', icono: 'informacion' },
  exito: { clases: 'border-l-success bg-success-soft text-success-strong', icono: 'exito' },
  advertencia: {
    clases: 'border-l-warning bg-warning-soft text-warning-strong',
    icono: 'advertencia',
  },
  error: { clases: 'border-l-danger bg-danger-soft text-danger-strong', icono: 'error' },
};

type Propiedades = Readonly<{ estado: EstadoAviso; titulo: string; children?: ReactNode }>;

/** Aviso dentro de la página. Los errores se anuncian de inmediato; el resto, con cortesía. */
export function Aviso({ estado, titulo, children }: Propiedades): ReactElement {
  const estilo = ESTILOS[estado];
  return (
    <div
      role={estado === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-lg border-l-4 p-4', estilo.clases)}
    >
      <Icono nombre={estilo.icono} className="mt-0.5" />
      <div className="flex flex-col gap-1">
        <p className="text-label">{titulo}</p>
        {children ? <div className="text-dense">{children}</div> : null}
      </div>
    </div>
  );
}
