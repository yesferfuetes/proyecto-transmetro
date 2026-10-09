import type { ReactElement } from 'react';
import { ChipEstado } from '@/shared/components/datos';
import type { Estado } from '@/shared/types/diseno';
import type { EstadoDeFlota } from '../schemas/flota-por-linea';

const ESTADO_VISUAL: Readonly<Record<EstadoDeFlota, Estado>> = {
  completa: 'exito',
  insuficiente: 'advertencia',
  excedida: 'error',
};

const ETIQUETA: Readonly<Record<EstadoDeFlota, string>> = {
  completa: 'Completa',
  insuficiente: 'Insuficiente',
  excedida: 'Excedida',
};

type Propiedades = Readonly<{ estado: EstadoDeFlota }>;

/** Si la flota de una línea está completa, insuficiente o excedida; siempre con ícono y texto. */
export function EstadoDeLaFlota({ estado }: Propiedades): ReactElement {
  return <ChipEstado estado={ESTADO_VISUAL[estado]}>{ETIQUETA[estado]}</ChipEstado>;
}
