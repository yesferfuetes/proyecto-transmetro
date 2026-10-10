import type { ReactElement } from 'react';
import { Tarjeta } from '@/shared/components/superficies';
import { formatearFechaHora } from '@/shared/lib/formato';
import type { Consulta } from '../schemas/consulta';
import { FiltrosAplicadosDeLaConsulta } from './filtros-aplicados';

const FORMATO = new Intl.NumberFormat('es-GT');

type Propiedades = Readonly<{ consulta: Consulta; total: number }>;

/** Cuándo se generó el reporte, con qué filtros y cuántas filas tiene. */
export function ResumenDeFiltros({ consulta, total }: Propiedades): ReactElement {
  return (
    <Tarjeta variante="densa" como="section" className="flex flex-col gap-2 text-dense">
      <p>
        <span className="text-ink-muted">Generado el </span>
        <time dateTime={consulta.fechaHora} className="text-label tabular-nums">
          {formatearFechaHora(consulta.fechaHora)}
        </time>
      </p>
      <div>
        <span className="text-ink-muted">Filtros: </span>
        <FiltrosAplicadosDeLaConsulta filtros={consulta.filtros} />
      </div>
      <p className="tabular-nums">
        {FORMATO.format(total)} {total === 1 ? 'resultado' : 'resultados'}
      </p>
    </Tarjeta>
  );
}
