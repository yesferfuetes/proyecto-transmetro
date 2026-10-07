import { describe, expect, it } from 'vitest';
import { archivosFuente, leer } from './fuentes';

const CATALOGO = 'shared/components/utilidades/icono.tsx';

describe('iconografía', () => {
  it('solo el componente Icono importa la librería de íconos', () => {
    const importadores = archivosFuente(/\.tsx?$/).filter((ruta) =>
      /from 'lucide-react'/.test(leer(ruta)),
    );
    expect(importadores).toEqual([CATALOGO]);
  });

  it('el componente Icono fija el grosor del trazo y no rellena', () => {
    const fuente = leer(CATALOGO);
    expect(fuente).toContain('strokeWidth={1.75}');
    expect(fuente).toContain('fill="none"');
  });
});
