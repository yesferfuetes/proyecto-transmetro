import { ESLint } from 'eslint';
import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Comprueba que la configuración de ESLint rechaza lo que los estándares prohíben.
 * Cada caso analiza un texto como si fuera el contenido de un archivo existente.
 */
const eslint = new ESLint({ cwd: process.cwd() });

async function reglasVioladas(codigo: string, archivo = 'src/app/page.tsx'): Promise<string[]> {
  const [resultado] = await eslint.lintText(codigo, { filePath: archivo });
  return (resultado?.messages ?? []).map((mensaje) => mensaje.ruleId ?? 'sin-regla');
}

function componente(clases: string): string {
  return [
    "import type { ReactElement } from 'react';",
    'export default function Ejemplo(): ReactElement {',
    `  return <p className="${clases}">Hola</p>;`,
    '}',
    '',
  ].join('\n');
}

// La primera llamada carga el análisis con tipos y el plugin de Tailwind; en el pipeline tarda
// más que el tiempo por prueba, así que se hace antes, con su propio margen.
beforeAll(async () => {
  await eslint.lintText('export {};\n', { filePath: 'src/app/layout.tsx' });
}, 60_000);

describe('configuración de ESLint del frontend', () => {
  it('acepta un componente que usa solo tokens', async () => {
    expect(await reglasVioladas(componente('text-primary'))).toEqual([]);
  });

  it('rechaza el uso de any', async () => {
    const codigo = 'export function eco(valor: any): string {\n  return String(valor);\n}\n';
    expect(await reglasVioladas(codigo, 'src/app/layout.tsx')).toContain(
      '@typescript-eslint/no-explicit-any',
    );
  });

  it('rechaza una variable que sombrea a otra', async () => {
    const codigo = [
      'export function sumar(valor: number): number {',
      '  const total = valor;',
      '  const calcular = (total: number): number => total + 1;',
      '  return calcular(total);',
      '}',
      '',
    ].join('\n');
    expect(await reglasVioladas(codigo, 'src/app/layout.tsx')).toContain(
      '@typescript-eslint/no-shadow',
    );
  });

  it('rechaza una variable sin uso', async () => {
    const codigo = 'export function uno(): number {\n  const sobrante = 2;\n  return 1;\n}\n';
    expect(await reglasVioladas(codigo, 'src/app/layout.tsx')).toContain(
      '@typescript-eslint/no-unused-vars',
    );
  });

  it('rechaza una función sin tipo de retorno', async () => {
    const codigo = 'export function uno() {\n  return 1;\n}\n';
    expect(await reglasVioladas(codigo, 'src/app/layout.tsx')).toContain(
      '@typescript-eslint/explicit-function-return-type',
    );
  });

  it('rechaza una función con complejidad mayor a 10', async () => {
    const condiciones = Array.from(
      { length: 10 },
      (_, indice) => `  if (valor === ${indice}) {\n    return ${indice};\n  }`,
    );
    const codigo = [
      'export function clasificar(valor: number): number {',
      ...condiciones,
      '  return -1;',
      '}',
      '',
    ].join('\n');
    expect(await reglasVioladas(codigo, 'src/app/layout.tsx')).toContain('complexity');
  });

  it('rechaza suprimir errores del compilador con ts-ignore', async () => {
    const codigo = '// @ts-ignore\nexport const valor: number = 1;\n';
    expect(await reglasVioladas(codigo, 'src/app/layout.tsx')).toContain(
      '@typescript-eslint/ban-ts-comment',
    );
  });

  it('rechaza un valor arbitrario de Tailwind', async () => {
    expect(await reglasVioladas(componente('text-[#1F3864]'))).toContain(
      'better-tailwindcss/no-restricted-classes',
    );
  });

  it('rechaza un color que no es un token declarado', async () => {
    expect(await reglasVioladas(componente('bg-red-500'))).toContain(
      'better-tailwindcss/no-unknown-classes',
    );
  });

  describe('fronteras entre módulos', () => {
    // Archivo interno real del módulo flota; existe solo mientras corren estas pruebas.
    const archivoInterno = join(process.cwd(), 'src/modules/flota/schemas/prueba-lint.ts');

    beforeAll(() => {
      writeFileSync(archivoInterno, 'export const interno = 1;\n');
    });

    afterAll(() => {
      rmSync(archivoInterno, { force: true });
    });

    it('acepta que el propio módulo importe su interior', async () => {
      const codigo = "export { interno } from './schemas/prueba-lint';\n";
      expect(await reglasVioladas(codigo, 'src/modules/flota/index.ts')).toEqual([]);
    });

    it('rechaza que otro módulo importe ese interior', async () => {
      const codigo = "export { interno } from '../flota/schemas/prueba-lint';\n";
      expect(await reglasVioladas(codigo, 'src/modules/red/index.ts')).toContain(
        'boundaries/dependencies',
      );
    });

    it('rechaza que una ruta importe ese interior', async () => {
      const codigo = "export { interno } from '@/modules/flota/schemas/prueba-lint';\n";
      expect(await reglasVioladas(codigo, 'src/app/layout.tsx')).toContain(
        'boundaries/dependencies',
      );
    });

    it('acepta la superficie pública de otro módulo y el núcleo compartido', async () => {
      const codigo = [
        "import * as flota from '../flota';",
        "import { cn } from '../../shared/lib/cn';",
        'export const usados = [flota, cn];',
        '',
      ].join('\n');
      expect(await reglasVioladas(codigo, 'src/modules/red/index.ts')).toEqual([]);
    });
  });
});
