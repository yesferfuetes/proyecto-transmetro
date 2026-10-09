// Suma el tamaño comprimido del JavaScript que recibe el navegador y falla si supera el
// presupuesto. Se ejecuta después de `npm run build`.
import { appendFileSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const PRESUPUESTO_KB = 450;
const CARPETA = '.next/static/chunks';

function archivosJs(carpeta) {
  return readdirSync(carpeta).flatMap((nombre) => {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) {
      return archivosJs(ruta);
    }
    return ruta.endsWith('.js') ? [ruta] : [];
  });
}

const bytes = archivosJs(CARPETA).reduce(
  (total, ruta) => total + gzipSync(readFileSync(ruta)).length,
  0,
);
const kilobytes = Math.round((bytes / 1024) * 10) / 10;
const informe = `JavaScript del navegador (gzip): ${kilobytes} KB de ${PRESUPUESTO_KB} KB permitidos.`;

console.log(informe);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${informe}\n`);
}
if (kilobytes > PRESUPUESTO_KB) {
  console.error('El paquete del navegador supera el presupuesto.');
  process.exit(1);
}
