'use client';

import type { ReactElement } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { BotonIcono } from '@/shared/components/acciones';
import { PuntoLinea } from '@/shared/components/datos';
import { Campo, CampoNumero } from '@/shared/components/formulario';
import type { FilaEditable } from '../hooks/recorrido';

const EN_EL_LIMITE = 'aria-disabled:cursor-not-allowed aria-disabled:opacity-50';

type Propiedades = Readonly<{
  codigoLinea: string;
  fila: FilaEditable;
  /** Identificador estable de la fila, para los ids de sus campos. */
  clave: string;
  posicion: number;
  total: number;
  distancia: UseFormRegisterReturn;
  error?: string;
  onSubir: () => void;
  onBajar: () => void;
  onQuitar: () => void;
}>;

/**
 * Una parada del editor. En los extremos, "Subir" y "Bajar" quedan marcados como no disponibles
 * sin perder el foco, para que el teclado no salte al mover una estación al borde.
 */
export function FilaDeRecorrido({
  codigoLinea,
  fila,
  clave,
  posicion,
  total,
  distancia,
  error,
  onSubir,
  onBajar,
  onQuitar,
}: Propiedades): ReactElement {
  const esPrimera = posicion === 1;
  const esUltima = posicion === total;
  const nombre = `${fila.codigo} ${fila.nombre}`;
  const idDistancia = `distancia-${clave}`;
  return (
    <li className="grid gap-3 border-t border-border py-4 first:border-t-0 md:grid-cols-12 md:items-start">
      <p className="flex min-h-control items-center gap-3 text-body text-ink md:col-span-5">
        <span className="text-ink-muted tabular-nums">{posicion}.</span>
        <PuntoLinea codigo={codigoLinea} nombre={`${fila.codigo} · ${fila.nombre}`} />
      </p>
      <div className="md:col-span-4">
        {esUltima ? (
          <Campo
            id={idDistancia}
            etiqueta={`Distancia de ${fila.codigo} a la siguiente`}
            ayuda="Última estación"
          >
            {(control) => <CampoNumero {...control} unidad="km" disabled value="" readOnly />}
          </Campo>
        ) : (
          <Campo
            id={idDistancia}
            etiqueta={`Distancia de ${fila.codigo} a la siguiente`}
            error={error}
          >
            {(control) => (
              <CampoNumero {...control} {...distancia} unidad="km" step="0.001" min="0.001" />
            )}
          </Campo>
        )}
      </div>
      <div className="flex gap-1 md:col-span-3 md:justify-end md:pt-7">
        <BotonIcono
          icono="flecha-arriba"
          etiqueta={`Subir ${nombre}`}
          aria-disabled={esPrimera || undefined}
          className={EN_EL_LIMITE}
          onClick={onSubir}
        />
        <BotonIcono
          icono="flecha-abajo"
          etiqueta={`Bajar ${nombre}`}
          aria-disabled={esUltima || undefined}
          className={EN_EL_LIMITE}
          onClick={onBajar}
        />
        <BotonIcono icono="cerrar" etiqueta={`Quitar ${nombre}`} onClick={onQuitar} />
      </div>
    </li>
  );
}
