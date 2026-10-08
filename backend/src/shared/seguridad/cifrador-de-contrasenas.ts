import { randomBytes, scrypt, ScryptOptions, timingSafeEqual } from 'node:crypto';

const N = 32_768;
const R = 8;
const P = 1;
const BYTES_DE_SAL = 16;
const BYTES_DE_CLAVE = 64;
const PREFIJO = 'scrypt';
// scrypt necesita 128 * N * r bytes; se deja margen sobre el límite por defecto de 32 MiB.
const MEMORIA_MAXIMA = 64 * 1024 * 1024;

function derivar(
  texto: string,
  sal: Buffer,
  opciones: ScryptOptions,
  largo: number,
): Promise<Buffer> {
  return new Promise((resolver, rechazar) => {
    scrypt(texto, sal, largo, { ...opciones, maxmem: MEMORIA_MAXIMA }, (error, clave) => {
      if (error) {
        rechazar(error);
        return;
      }
      resolver(clave);
    });
  });
}

/** Devuelve `scrypt$N$r$p$<sal base64>$<clave base64>`. */
export async function cifrarContrasena(texto: string): Promise<string> {
  const sal = randomBytes(BYTES_DE_SAL);
  const clave = await derivar(texto, sal, { N, r: R, p: P }, BYTES_DE_CLAVE);
  return [PREFIJO, N, R, P, sal.toString('base64'), clave.toString('base64')].join('$');
}

interface Guardado {
  opciones: ScryptOptions;
  sal: Buffer;
  clave: Buffer;
}

function leerGuardado(guardado: string): Guardado | null {
  const partes = guardado.split('$');
  if (partes.length !== 6 || partes[0] !== PREFIJO) {
    return null;
  }
  const [, n, r, p, sal, clave] = partes;
  const numeros = [n, r, p].map(Number);
  if (numeros.some((numero) => !Number.isInteger(numero) || numero <= 0)) {
    return null;
  }
  const bytesDeClave = Buffer.from(clave ?? '', 'base64');
  if (bytesDeClave.length === 0) {
    return null;
  }
  return {
    opciones: { N: numeros[0], r: numeros[1], p: numeros[2] },
    sal: Buffer.from(sal ?? '', 'base64'),
    clave: bytesDeClave,
  };
}

/** Compara en tiempo constante. Un valor guardado con formato inválido nunca coincide. */
export async function verificarContrasena(texto: string, guardado: string): Promise<boolean> {
  const leido = leerGuardado(guardado);
  if (leido === null) {
    return false;
  }
  try {
    const clave = await derivar(texto, leido.sal, leido.opciones, leido.clave.length);
    return timingSafeEqual(clave, leido.clave);
  } catch {
    return false;
  }
}
