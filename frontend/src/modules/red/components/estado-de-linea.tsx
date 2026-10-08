import type { ReactElement } from 'react';
import { ChipEstado } from '@/shared/components/datos';
import type { Estado, Tono } from '@/shared/types/diseno';
import { ETIQUETA_DE_ESTADO, type EstadoLinea } from '../schemas/comunes';

const ESTADO_VISUAL: Readonly<Record<EstadoLinea, Estado>> = {
  ACTIVA: 'exito',
  EN_CONSTRUCCION: 'advertencia',
  INACTIVA: 'neutro',
};

type Propiedades = Readonly<{ estado: EstadoLinea; tono?: Tono }>;

/** Estado de una línea como píldora con ícono y texto. */
export function EstadoDeLinea({ estado, tono = 'claro' }: Propiedades): ReactElement {
  return (
    <ChipEstado estado={ESTADO_VISUAL[estado]} tono={tono}>
      {ETIQUETA_DE_ESTADO[estado]}
    </ChipEstado>
  );
}
