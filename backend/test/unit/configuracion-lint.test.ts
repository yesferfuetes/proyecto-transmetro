import { ESLint } from 'eslint';

/**
 * Comprueba que la configuración de ESLint rechaza lo que el estándar de backend prohíbe.
 * Cada caso analiza un texto como si fuera el contenido de src/main.ts.
 */
const eslint = new ESLint({ cwd: process.cwd() });

async function reglasVioladas(codigo: string): Promise<string[]> {
  const [resultado] = await eslint.lintText(codigo, { filePath: 'src/main.ts' });
  return (resultado?.messages ?? []).map((mensaje) => mensaje.ruleId ?? 'sin-regla');
}

describe('configuración de ESLint del backend', () => {
  it('acepta código que cumple las reglas', async () => {
    const codigo = 'export function doble(valor: number): number {\n  return valor * 2;\n}\n';
    expect(await reglasVioladas(codigo)).toEqual([]);
  });

  it('rechaza el uso de any', async () => {
    const codigo = 'export function eco(valor: any): string {\n  return String(valor);\n}\n';
    expect(await reglasVioladas(codigo)).toContain('@typescript-eslint/no-explicit-any');
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
    expect(await reglasVioladas(codigo)).toContain('@typescript-eslint/no-shadow');
  });

  it('rechaza una variable sin uso', async () => {
    const codigo = 'export function uno(): number {\n  const sobrante = 2;\n  return 1;\n}\n';
    expect(await reglasVioladas(codigo)).toContain('@typescript-eslint/no-unused-vars');
  });

  it('rechaza una función sin tipo de retorno', async () => {
    const codigo = 'export function uno() {\n  return 1;\n}\n';
    expect(await reglasVioladas(codigo)).toContain(
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
    expect(await reglasVioladas(codigo)).toContain('complexity');
  });

  it('rechaza suprimir errores del compilador con ts-ignore', async () => {
    const codigo = '// @ts-ignore\nexport const valor: number = 1;\n';
    expect(await reglasVioladas(codigo)).toContain('@typescript-eslint/ban-ts-comment');
  });
});
