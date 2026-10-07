import type { CSSProperties, ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import estilos from './progreso-segmentado.module.css';

export type Segmento = Readonly<{ clave: string; desde: number; hasta: number; clase: string }>;
export type Marca = Readonly<{ valor: number; etiqueta: string }>;

type Propiedades = Readonly<{
  etiqueta: string;
  segmentos: readonly Segmento[];
  maximo: number;
  valor: number;
  textoValor: string;
  marcas?: readonly Marca[];
  /** Clases de la pista y del marcador según la superficie. */
  pista: string;
  marcador: string;
  textoMarcas: string;
  alto: 'h-2' | 'h-3';
}>;

function variable(nombre: string, valor: string | number): CSSProperties {
  return { [nombre]: valor };
}

function porcentaje(valor: number, maximo: number): string {
  return `${(Math.min(Math.max(valor, 0), maximo) / maximo) * 100}%`;
}

/** Barra dividida en segmentos con un marcador en el valor actual. */
export function ProgresoSegmentado({
  etiqueta,
  segmentos,
  maximo,
  valor,
  textoValor,
  marcas = [],
  pista,
  marcador,
  textoMarcas,
  alto,
}: Propiedades): ReactElement {
  return (
    <div
      role="meter"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={maximo}
      aria-valuenow={Math.min(Math.max(valor, 0), maximo)}
      aria-valuetext={textoValor}
      className="relative pt-3"
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0 size-0 border-x-6 border-t-8 border-x-transparent',
          marcador,
          estilos.posicionado,
        )}
        style={variable('--posicion', porcentaje(valor, maximo))}
      />
      <div className={cn('flex gap-0.5 overflow-hidden rounded-full', alto, pista)}>
        {segmentos.map((segmento) => (
          <span
            key={segmento.clave}
            className={cn('h-full', segmento.clase, estilos.segmento)}
            style={variable('--peso', segmento.hasta - segmento.desde)}
          />
        ))}
      </div>
      <div aria-hidden="true" className={cn('relative mt-1 h-4 text-eyebrow', textoMarcas)}>
        {marcas.map((marca) => (
          <span
            key={marca.valor}
            className={cn('absolute top-0 tabular-nums', estilos.posicionado)}
            style={variable('--posicion', porcentaje(marca.valor, maximo))}
          >
            {marca.etiqueta}
          </span>
        ))}
      </div>
    </div>
  );
}
