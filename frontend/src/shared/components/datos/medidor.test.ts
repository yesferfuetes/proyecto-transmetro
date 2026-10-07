import { describe, expect, it } from 'vitest';
import { calcularMedidor } from './medidor';

const UMBRALES = { bajo: 25, alto: 150 };

describe('calcularMedidor', () => {
  it.each([
    [18, 'baja', '18 %'],
    [25, 'normal', '25 %'],
    [100, 'normal', '100 %'],
    [149.6, 'normal', '150 %'],
    [150, 'sobrecupo', '150 %'],
    [182, 'sobrecupo', '182 %'],
  ])('%s %% cae en el segmento %s', (porcentaje, segmento, texto) => {
    const medicion = calcularMedidor(porcentaje, UMBRALES);
    expect(medicion.segmento).toBe(segmento);
    expect(medicion.texto).toBe(texto);
    expect(medicion.recortado).toBe(false);
  });

  it('ubica el marcador en proporción a la escala de 0 a 200', () => {
    expect(calcularMedidor(50, UMBRALES).posicion).toBe(25);
    expect(calcularMedidor(150, UMBRALES).posicion).toBe(75);
  });

  it('por encima del máximo fija el marcador al final y lo dice en el texto', () => {
    const medicion = calcularMedidor(260, UMBRALES);
    expect(medicion).toMatchObject({
      segmento: 'sobrecupo',
      posicion: 100,
      valorEnEscala: 200,
      recortado: true,
      texto: 'más de 200 %',
    });
  });

  it('un valor negativo se trata como cero', () => {
    expect(calcularMedidor(-5, UMBRALES)).toMatchObject({
      segmento: 'baja',
      posicion: 0,
      texto: '0 %',
    });
  });
});
