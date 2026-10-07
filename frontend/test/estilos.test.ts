import { describe, expect, it } from 'vitest';
import { archivosFuente, leer } from './fuentes';

// El marcador de la barra segmentada es el único estilo calculado en tiempo de ejecución.
const UNICO_ESTILO_EN_LINEA = 'shared/components/datos/progreso-segmentado.tsx';

describe('estilos', () => {
  it('ningún archivo usa @apply', () => {
    const conApply = archivosFuente(/\.(css|tsx?)$/).filter((ruta) =>
      leer(ruta).includes('@apply'),
    );
    expect(conApply).toEqual([]);
  });

  it('solo la barra segmentada usa estilos en línea', () => {
    const conEstilo = archivosFuente(/\.tsx$/).filter((ruta) => /\bstyle=\{/.test(leer(ruta)));
    expect(conEstilo.filter((ruta) => ruta !== UNICO_ESTILO_EN_LINEA)).toEqual([]);
  });
});
