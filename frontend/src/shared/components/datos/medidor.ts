export type SegmentoOcupacion = 'baja' | 'normal' | 'sobrecupo';

export type Umbrales = Readonly<{ bajo: number; alto: number }>;

export type Medicion = Readonly<{
  segmento: SegmentoOcupacion;
  /** Posición del marcador en la pista, de 0 a 100. */
  posicion: number;
  /** Valor dentro de la escala, para `aria-valuenow`. */
  valorEnEscala: number;
  recortado: boolean;
  texto: string;
}>;

export const ETIQUETA_DE_SEGMENTO: Record<SegmentoOcupacion, string> = {
  baja: 'Baja ocupación',
  normal: 'Normal',
  sobrecupo: 'Sobrecupo',
};

function segmentoDe(porcentaje: number, umbrales: Umbrales): SegmentoOcupacion {
  if (porcentaje < umbrales.bajo) {
    return 'baja';
  }
  return porcentaje >= umbrales.alto ? 'sobrecupo' : 'normal';
}

/** Ubica un porcentaje en la escala de 0 a `maximo` y clasifica su segmento según los umbrales. */
export function calcularMedidor(porcentaje: number, umbrales: Umbrales, maximo = 200): Medicion {
  const valor = Math.max(0, porcentaje);
  const recortado = valor > maximo;
  const valorEnEscala = Math.min(valor, maximo);
  return {
    segmento: segmentoDe(valor, umbrales),
    posicion: (valorEnEscala / maximo) * 100,
    valorEnEscala,
    recortado,
    texto: recortado ? `más de ${maximo} %` : `${Math.round(valor)} %`,
  };
}
