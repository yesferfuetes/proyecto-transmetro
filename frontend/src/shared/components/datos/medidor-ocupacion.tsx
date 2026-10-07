import type { ReactElement } from 'react';
import type { Estado, Tono } from '@/shared/types/diseno';
import { ChipEstado } from './chip-estado';
import {
  calcularMedidor,
  ETIQUETA_DE_SEGMENTO,
  type SegmentoOcupacion,
  type Umbrales,
} from './medidor';
import { ProgresoSegmentado } from './progreso-segmentado';

const MAXIMO = 200;

const COLOR_DE_SEGMENTO: Record<Tono, Record<SegmentoOcupacion, string>> = {
  claro: { baja: 'bg-warning', normal: 'bg-success-600', sobrecupo: 'bg-danger' },
  oscuro: {
    baja: 'bg-warning-on-night',
    normal: 'bg-success-on-night',
    sobrecupo: 'bg-danger-on-night',
  },
};

const ESTADO_DE_SEGMENTO: Record<SegmentoOcupacion, Estado> = {
  baja: 'advertencia',
  normal: 'exito',
  sobrecupo: 'error',
};

const ICONO_DE_SEGMENTO = {
  baja: 'baja-ocupacion',
  normal: 'exito',
  sobrecupo: 'sobrecupo',
} as const;

type Propiedades = Readonly<{
  porcentaje: number;
  /** Nombre de la magnitud medida, p. ej. "Ocupación". */
  etiqueta: string;
  umbrales: Umbrales;
  tono?: Tono;
  tamano?: 'normal' | 'grande';
}>;

/** Barra de ocupación con los umbrales de baja ocupación y sobrecupo, y el valor en texto. */
export function MedidorOcupacion({
  porcentaje,
  etiqueta,
  umbrales,
  tono = 'claro',
  tamano = 'normal',
}: Propiedades): ReactElement {
  const medicion = calcularMedidor(porcentaje, umbrales, MAXIMO);
  const estado = ETIQUETA_DE_SEGMENTO[medicion.segmento];
  const colores = COLOR_DE_SEGMENTO[tono];
  const oscuro = tono === 'oscuro';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={oscuro ? 'text-label text-ink-inverse' : 'text-label text-ink'}>
          {etiqueta}
        </span>
        <span className="flex items-center gap-2">
          <span
            className={
              oscuro
                ? 'text-label text-ink-inverse tabular-nums'
                : 'text-label text-ink tabular-nums'
            }
          >
            {medicion.texto}
          </span>
          <ChipEstado
            estado={ESTADO_DE_SEGMENTO[medicion.segmento]}
            icono={ICONO_DE_SEGMENTO[medicion.segmento]}
            tono={tono}
          >
            {estado}
          </ChipEstado>
        </span>
      </div>
      <ProgresoSegmentado
        etiqueta={etiqueta}
        maximo={MAXIMO}
        valor={medicion.valorEnEscala}
        textoValor={`${medicion.texto}, ${estado.toLowerCase()}`}
        segmentos={[
          { clave: 'baja', desde: 0, hasta: umbrales.bajo, clase: colores.baja },
          { clave: 'normal', desde: umbrales.bajo, hasta: umbrales.alto, clase: colores.normal },
          { clave: 'sobrecupo', desde: umbrales.alto, hasta: MAXIMO, clase: colores.sobrecupo },
        ]}
        marcas={[
          { valor: umbrales.bajo, etiqueta: `${umbrales.bajo} %` },
          { valor: umbrales.alto, etiqueta: `${umbrales.alto} %` },
        ]}
        pista={oscuro ? 'bg-night-raised' : 'bg-neutral-100'}
        marcador={oscuro ? 'border-t-ink-inverse' : 'border-t-ink'}
        textoMarcas={oscuro ? 'text-ink-inverse-muted' : 'text-ink-muted'}
        alto={tamano === 'grande' ? 'h-3' : 'h-2'}
      />
    </div>
  );
}
