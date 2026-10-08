import type { CodigoLinea, Tono } from '@/shared/types/diseno';

type EstiloDeLinea = Readonly<{
  /** Fondo y texto de la insignia. */
  insignia: string;
  /** Color sólido para puntos y trazos. */
  punto: string;
  /** Borde izquierdo de tarjetas y filas. */
  borde: string;
  /** Contorno cuando el color no alcanza 3:1 contra su fondo. */
  contornoClaro: string;
  contornoOscuro: string;
  nombre: string;
}>;

const CONTORNO_CLARO = 'ring-1 ring-border-strong';
const CONTORNO_OSCURO = 'ring-1 ring-neutral-400';

// Colores oficiales de cada línea. El texto de la insignia es el de mayor contraste.
const LINEAS: Readonly<Record<string, EstiloDeLinea>> = {
  '1': {
    insignia: 'bg-linea-1 text-ink-inverse',
    punto: 'bg-linea-1',
    borde: 'border-l-linea-1',
    contornoClaro: '',
    contornoOscuro: CONTORNO_OSCURO,
    nombre: 'Línea 1',
  },
  '2': {
    insignia: 'bg-linea-2 text-ink',
    punto: 'bg-linea-2',
    borde: 'border-l-linea-2',
    contornoClaro: CONTORNO_CLARO,
    contornoOscuro: '',
    nombre: 'Línea 2',
  },
  '6': {
    insignia: 'bg-linea-6 text-ink',
    punto: 'bg-linea-6',
    borde: 'border-l-linea-6',
    contornoClaro: CONTORNO_CLARO,
    contornoOscuro: '',
    nombre: 'Línea 6',
  },
  '7': {
    insignia: 'bg-linea-7 text-ink',
    punto: 'bg-linea-7',
    borde: 'border-l-linea-7',
    contornoClaro: CONTORNO_CLARO,
    contornoOscuro: '',
    nombre: 'Línea 7',
  },
  '12': {
    insignia: 'bg-linea-12 text-ink',
    punto: 'bg-linea-12',
    borde: 'border-l-linea-12',
    contornoClaro: '',
    contornoOscuro: '',
    nombre: 'Línea 12',
  },
  '13': {
    insignia: 'bg-linea-13 text-ink',
    punto: 'bg-linea-13',
    borde: 'border-l-linea-13',
    contornoClaro: CONTORNO_CLARO,
    contornoOscuro: '',
    nombre: 'Línea 13',
  },
  '18': {
    insignia: 'bg-linea-18 text-ink',
    punto: 'bg-linea-18',
    borde: 'border-l-linea-18',
    contornoClaro: CONTORNO_CLARO,
    contornoOscuro: '',
    nombre: 'Línea 18',
  },
  R5: {
    insignia: 'bg-linea-r5 text-ink-inverse',
    punto: 'bg-linea-r5',
    borde: 'border-l-linea-r5',
    contornoClaro: '',
    contornoOscuro: CONTORNO_OSCURO,
    nombre: 'Ruta 5',
  },
};

function neutra(codigo: string): EstiloDeLinea {
  return {
    insignia: 'bg-neutral-600 text-ink-inverse',
    punto: 'bg-neutral-600',
    borde: 'border-l-neutral-600',
    contornoClaro: '',
    contornoOscuro: CONTORNO_OSCURO,
    nombre: `Línea ${codigo}`,
  };
}

export type EstiloResuelto = Readonly<{
  insignia: string;
  punto: string;
  borde: string;
  contorno: string;
  nombre: string;
  /** Lo que se escribe dentro de la insignia. */
  rotulo: string;
}>;

/** Estilo de identidad de una línea. Una línea sin color asignado usa la insignia neutra. */
export function estiloDeLinea(codigo: CodigoLinea, tono: Tono = 'claro'): EstiloResuelto {
  // El backend nombra las líneas "L1", "L12"; el color y el rótulo usan solo el número.
  const normalizado = codigo
    .trim()
    .toUpperCase()
    .replace(/^L(?=\d+$)/, '');
  const estilo = LINEAS[normalizado] ?? neutra(normalizado);
  return {
    insignia: estilo.insignia,
    punto: estilo.punto,
    borde: estilo.borde,
    contorno: tono === 'claro' ? estilo.contornoClaro : estilo.contornoOscuro,
    nombre: estilo.nombre,
    rotulo: normalizado,
  };
}
