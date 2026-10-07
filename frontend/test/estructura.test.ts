import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const MODULOS = ['usuarios', 'red', 'accesos', 'flota', 'pilotos', 'alertas', 'reportes'];
const CARPETAS = ['components', 'actions', 'data', 'hooks', 'store', 'schemas', 'types'];
const RAIZ = join(__dirname, '..', 'src', 'modules');

describe.each(MODULOS)('estructura del módulo %s', (modulo) => {
  it.each(CARPETAS)('tiene la carpeta %s', (carpeta) => {
    expect(existsSync(join(RAIZ, modulo, carpeta))).toBe(true);
  });

  it('declara su superficie pública en index.ts', () => {
    expect(existsSync(join(RAIZ, modulo, 'index.ts'))).toBe(true);
  });
});
