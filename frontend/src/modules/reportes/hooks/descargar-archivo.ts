import type { Archivo } from '../schemas/opciones';

const MARCA_DE_ORDEN_DE_BYTES = '﻿';

/** Contenido del archivo con la marca UTF-8 que necesita Excel para leer los acentos. */
export function contenidoConMarca(contenido: string): string {
  return contenido.startsWith(MARCA_DE_ORDEN_DE_BYTES)
    ? contenido
    : `${MARCA_DE_ORDEN_DE_BYTES}${contenido}`;
}

/** Arma el archivo en el navegador y lo descarga con el nombre que dio el backend. */
export function descargarArchivo(archivo: Archivo): void {
  const url = URL.createObjectURL(
    new Blob([contenidoConMarca(archivo.contenido)], { type: 'text/csv;charset=utf-8' }),
  );
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = archivo.nombreDeArchivo;
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
