import 'server-only';

/** Tiempo máximo de espera de toda llamada de la red al backend. */
export const TIEMPO_DE_ESPERA_MS = 5000;

/** Filas por página de los listados. */
export const TAMANO_DE_PAGINA = 25;

/** Tamaño máximo que acepta el backend; se usa para las listas de los selectores. */
export const TAMANO_MAXIMO = 100;

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
