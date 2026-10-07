/**
 * Generador pseudoaleatorio con semilla fija (mulberry32). Los datos ficticios salen iguales en
 * cada ejecución, así que sembrar dos veces no cambia nada.
 */
export function crearGenerador(semilla: number): () => number {
  let estado = semilla >>> 0;
  return (): number => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Distancia ficticia entre 0.400 y 1.200 km, con tres decimales. */
export function distanciaFicticia(generador: () => number): number {
  return Math.round((0.4 + generador() * 0.8) * 1000) / 1000;
}

export function elegir<T>(opciones: readonly T[], indice: number): T {
  const valor = opciones[indice % opciones.length];
  if (valor === undefined) {
    throw new Error('No hay opciones para elegir.');
  }
  return valor;
}

export function rellenar(numero: number, ancho: number): string {
  return String(numero).padStart(ancho, '0');
}
