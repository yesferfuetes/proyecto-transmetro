import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ErrorDeNegocio } from '../../src/shared/errors/error-de-negocio';

const MODULOS = ['usuarios', 'red', 'accesos', 'flota', 'pilotos', 'alertas', 'reportes'];

const CARPETAS = [
  'infrastructure/adapters',
  'commands/handlers',
  'commands/impl',
  'queries/handlers',
  'queries/impl',
  'events/event-listeners',
  'controllers',
  'dtos',
  'entities',
  'errors',
  'services',
  'strategies',
];

const RAIZ = join(__dirname, '..', '..', 'src');

describe.each(MODULOS)('estructura del módulo %s', (modulo) => {
  it.each(CARPETAS)('tiene la carpeta %s', (carpeta) => {
    expect(existsSync(join(RAIZ, modulo, carpeta))).toBe(true);
  });

  it('tiene su archivo de módulo', () => {
    expect(existsSync(join(RAIZ, modulo, `${modulo}.module.ts`))).toBe(true);
  });

  it('declara en businessError.ts una base que extiende ErrorDeNegocio', async () => {
    const exportado = (await import(join(RAIZ, modulo, 'errors', 'businessError'))) as Record<
      string,
      unknown
    >;
    const clases = Object.values(exportado).filter(
      (valor): valor is { prototype: unknown } => typeof valor === 'function',
    );
    expect(clases).toHaveLength(1);
    expect(clases[0]?.prototype).toBeInstanceOf(ErrorDeNegocio);
  });
});
