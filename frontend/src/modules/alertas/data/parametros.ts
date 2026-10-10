import 'server-only';

/** Tiempo máximo de espera de toda llamada de las alertas al backend. */
export const TIEMPO_DE_ESPERA_MS = 5000;

type Valor = string | number | boolean | undefined;

/** Arma la ruta con su consulta, omitiendo los valores vacíos. */
export function rutaConConsulta(ruta: string, parametros: Readonly<Record<string, Valor>>): string {
  const consulta = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined) {
      consulta.set(clave, String(valor));
    }
  }
  const texto = consulta.toString();
  return texto === '' ? ruta : `${ruta}?${texto}`;
}
