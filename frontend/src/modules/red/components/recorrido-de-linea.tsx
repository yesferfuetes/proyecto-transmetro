import type { ReactElement } from 'react';
import { ChipEstado, estiloDeLinea } from '@/shared/components/datos';
import { cn } from '@/shared/lib/cn';
import { formatearKm } from '@/shared/lib/formato';
import type { ParadaDeRecorrido } from '../schemas/linea';

type Propiedades = Readonly<{
  codigoLinea: string;
  recorrido: readonly ParadaDeRecorrido[];
  longitudKm: number | null;
  /** Estación del operador; se marca como "Tu estación". */
  estacionResaltadaId?: number;
}>;

/**
 * Recorrido como lista vertical: un punto por estación unido al siguiente por un trazo del color
 * de la línea. Las posiciones y distancias van siempre en texto.
 */
export function RecorridoDeLinea({
  codigoLinea,
  recorrido,
  longitudKm,
  estacionResaltadaId,
}: Propiedades): ReactElement {
  const estilo = estiloDeLinea(codigoLinea);
  const ultima = recorrido.length - 1;
  return (
    <div className="flex flex-col gap-6">
      <ol aria-label={`Recorrido de ${estilo.nombre}`} className="flex flex-col">
        {recorrido.map((parada, indice) => (
          <li key={parada.estacion.id} className="relative flex gap-4 pb-6 last:pb-0">
            {indice < ultima ? (
              <span
                aria-hidden="true"
                data-trazo=""
                className={cn('absolute top-3 bottom-0 left-1 w-1', estilo.punto)}
              />
            ) : null}
            <span
              aria-hidden="true"
              data-punto=""
              className={cn(
                'relative mt-1.5 size-3 shrink-0 rounded-full',
                estilo.punto,
                estilo.contorno,
              )}
            />
            <div className="flex min-w-0 flex-col gap-1">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body text-ink">
                <span className="text-ink-muted tabular-nums">{parada.posicion}.</span>
                <span className="text-label">{parada.estacion.codigo}</span>
                <span>{parada.estacion.nombre}</span>
                {parada.estacion.id === estacionResaltadaId ? (
                  <ChipEstado estado="informacion" icono="estaciones">
                    Tu estación
                  </ChipEstado>
                ) : null}
              </p>
              <p className="text-dense text-ink-muted">{parada.estacion.municipalidadNombre}</p>
              <p className="text-dense text-ink-muted tabular-nums">
                {indice === ultima
                  ? 'Última estación'
                  : `${formatearKm(parada.distanciaSiguienteKm)} a la siguiente`}
                {' · '}
                {`${formatearKm(parada.distanciaAcumuladaKm)} desde el inicio`}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <dl className="flex items-baseline gap-2 border-t border-border pt-4">
        <dt className="text-label text-ink">Longitud total</dt>
        <dd className="text-body text-ink tabular-nums">{formatearKm(longitudKm)}</dd>
      </dl>
    </div>
  );
}
