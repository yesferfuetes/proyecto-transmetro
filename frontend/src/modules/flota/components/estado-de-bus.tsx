import type { ReactElement } from 'react';
import { ChipEstado } from '@/shared/components/datos';
import type { Estado, Tono } from '@/shared/types/diseno';
import { ETIQUETA_DE_ESTADO_DE_BUS, type EstadoDeBus } from '../schemas/bus';

const ESTADO_VISUAL: Readonly<Record<EstadoDeBus, Estado>> = {
  ACTIVO: 'exito',
  MANTENIMIENTO: 'advertencia',
  BAJA: 'neutro',
};

type Propiedades = Readonly<{ estado: EstadoDeBus; tono?: Tono }>;

/** Estado de un bus como píldora con ícono y texto. */
export function EstadoDelBus({ estado, tono = 'claro' }: Propiedades): ReactElement {
  return (
    <ChipEstado estado={ESTADO_VISUAL[estado]} tono={tono}>
      {ETIQUETA_DE_ESTADO_DE_BUS[estado]}
    </ChipEstado>
  );
}
