import { describe, expect, it } from 'vitest';
import { destinosPermitidos, estaActivo, particionarNavegacion, type Destino } from './destinos';

function destino(href: string, roles: readonly string[] = ['supervisor']): Destino {
  return { href, etiqueta: href, icono: 'inicio', roles };
}

describe('destinosPermitidos', () => {
  it('deja solo los destinos del rol, en el mismo orden', () => {
    const destinos = [
      destino('/inicio', ['supervisor', 'administrador']),
      destino('/usuarios', ['administrador']),
      destino('/flota', ['supervisor', 'administrador']),
    ];

    expect(destinosPermitidos(destinos, 'supervisor').map((d) => d.href)).toEqual([
      '/inicio',
      '/flota',
    ]);
    expect(destinosPermitidos(destinos, 'administrador').map((d) => d.href)).toEqual([
      '/inicio',
      '/usuarios',
      '/flota',
    ]);
  });
});

describe('particionarNavegacion', () => {
  const siete = ['/a', '/b', '/c', '/d', '/e', '/f', '/g'].map((href) => destino(href));

  it('con más de cinco destinos muestra cuatro y manda el resto a "Más"', () => {
    const { visibles, mas } = particionarNavegacion(siete);
    expect(visibles.map((d) => d.href)).toEqual(['/a', '/b', '/c', '/d']);
    expect(mas.map((d) => d.href)).toEqual(['/e', '/f', '/g']);
  });

  it('con cinco o menos no agrega "Más"', () => {
    expect(particionarNavegacion(siete.slice(0, 5)).mas).toEqual([]);
    expect(particionarNavegacion(siete.slice(0, 3)).visibles).toHaveLength(3);
  });
});

describe('estaActivo', () => {
  it('marca la ruta exacta y sus subrutas, no las que solo comparten prefijo', () => {
    expect(estaActivo('/flota', '/flota')).toBe(true);
    expect(estaActivo('/flota/12', '/flota')).toBe(true);
    expect(estaActivo('/flotas', '/flota')).toBe(false);
  });
});
