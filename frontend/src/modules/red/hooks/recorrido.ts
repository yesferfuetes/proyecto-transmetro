import type { ParadaDeRecorrido } from '../schemas/linea';
import type { FormularioRecorrido } from '../schemas/recorrido';

/** Una parada tal como se edita: la distancia es el texto del campo. */
export type FilaEditable = Readonly<{
  estacionId: number;
  codigo: string;
  nombre: string;
  distancia: string;
}>;

function metros(texto: string): number {
  const km = Number(texto);
  return texto.trim() !== '' && Number.isFinite(km) && km > 0 ? Math.round(km * 1000) : 0;
}

/**
 * Longitud que tendrá la línea al guardar: suma de las distancias salvo la de la última parada.
 * Se suma en metros enteros para que 1.200 + 0.800 dé 2.000 exacto.
 */
export function longitudResultante(filas: readonly FilaEditable[]): number | null {
  if (filas.length === 0) {
    return null;
  }
  const total = filas.slice(0, -1).reduce((suma, fila) => suma + metros(fila.distancia), 0);
  return total / 1000;
}

/** Convierte las filas en la entrada de la acción; la última parada no lleva distancia. */
export function entradaDeRecorrido(filas: readonly FilaEditable[]): FormularioRecorrido {
  return {
    paradas: filas.map((fila, indice) => ({
      estacionId: fila.estacionId,
      distanciaSiguienteKm:
        indice === filas.length - 1 || fila.distancia.trim() === '' ? null : Number(fila.distancia),
    })),
  };
}

/** Recorrido vigente como filas del editor: solo lo que el editor usa llega al navegador. */
export function filasDeRecorrido(recorrido: readonly ParadaDeRecorrido[]): FilaEditable[] {
  return recorrido.map((parada) => ({
    estacionId: parada.estacion.id,
    codigo: parada.estacion.codigo,
    nombre: parada.estacion.nombre,
    distancia: parada.distanciaSiguienteKm?.toString() ?? '',
  }));
}
