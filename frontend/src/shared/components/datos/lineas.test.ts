import { describe, expect, it } from 'vitest';
import { estiloDeLinea } from './lineas';

describe('estiloDeLinea', () => {
  it.each([
    ['1', 'bg-linea-1 text-ink-inverse', 'Línea 1'],
    ['2', 'bg-linea-2 text-ink', 'Línea 2'],
    ['6', 'bg-linea-6 text-ink', 'Línea 6'],
    ['7', 'bg-linea-7 text-ink', 'Línea 7'],
    ['12', 'bg-linea-12 text-ink', 'Línea 12'],
    ['13', 'bg-linea-13 text-ink', 'Línea 13'],
    ['18', 'bg-linea-18 text-ink', 'Línea 18'],
    ['R5', 'bg-linea-r5 text-ink-inverse', 'Ruta 5'],
  ])(
    'la línea %s usa su color oficial y el texto de mayor contraste',
    (codigo, insignia, nombre) => {
      const estilo = estiloDeLinea(codigo);
      expect(estilo.insignia).toBe(insignia);
      expect(estilo.nombre).toBe(nombre);
    },
  );

  it.each(['2', '6', '7', '13', '18'])('la línea %s lleva contorno sobre fondo claro', (codigo) => {
    expect(estiloDeLinea(codigo, 'claro').contorno).not.toBe('');
    expect(estiloDeLinea(codigo, 'oscuro').contorno).toBe('');
  });

  it.each(['1', 'R5'])('la línea %s lleva contorno sobre fondo oscuro', (codigo) => {
    expect(estiloDeLinea(codigo, 'oscuro').contorno).not.toBe('');
    expect(estiloDeLinea(codigo, 'claro').contorno).toBe('');
  });

  it('acepta el código en minúsculas y con espacios', () => {
    expect(estiloDeLinea(' r5 ').nombre).toBe('Ruta 5');
  });

  it.each([
    ['L1', 'bg-linea-1 text-ink-inverse', '1'],
    ['l12', 'bg-linea-12 text-ink', '12'],
    [' L13 ', 'bg-linea-13 text-ink', '13'],
  ])('acepta el código del backend %s', (codigo, insignia, rotulo) => {
    const estilo = estiloDeLinea(codigo);
    expect(estilo.insignia).toBe(insignia);
    expect(estilo.rotulo).toBe(rotulo);
  });

  it('no confunde una ruta ni un código que solo empieza con L', () => {
    expect(estiloDeLinea('R5').rotulo).toBe('R5');
    expect(estiloDeLinea('LX').insignia).toBe('bg-neutral-600 text-ink-inverse');
    expect(estiloDeLinea('L20').nombre).toBe('Línea 20');
  });

  it('una línea sin color asignado usa la insignia neutra', () => {
    const estilo = estiloDeLinea('20');
    expect(estilo.insignia).toBe('bg-neutral-600 text-ink-inverse');
    expect(estilo.nombre).toBe('Línea 20');
    expect(estilo.rotulo).toBe('20');
  });
});
