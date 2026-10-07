import { describe, expect, it } from 'vitest';
import { archivosFuente, leer } from './fuentes';

// Componentes compartidos que necesitan interacción; el resto se renderiza en el servidor.
const CLIENTE = [
  'shared/components/acciones/boton-enviar.tsx',
  'shared/components/formulario/resumen-errores.tsx',
  'shared/components/navegacion/enlace-navegacion.tsx',
  'shared/components/navegacion/hoja-mas.tsx',
  'shared/components/superposiciones/aviso-efimero.tsx',
  'shared/components/superposiciones/desplegable.tsx',
  'shared/components/superposiciones/dialogo.tsx',
  'shared/components/superposiciones/hoja.tsx',
  'shared/components/superposiciones/modal-nativo.tsx',
  'shared/components/superposiciones/region-avisos.tsx',
  'shared/components/tabla/filtro-seleccion.tsx',
];

describe('frontera servidor–cliente de los componentes compartidos', () => {
  it('solo los componentes interactivos se marcan como cliente', () => {
    const marcados = archivosFuente(/^shared\/components\/.*\.tsx$/)
      .filter((ruta) => /^'use client';/.test(leer(ruta)))
      .sort();
    expect(marcados).toEqual(CLIENTE);
  });

  it('ningún layout ni página del área autenticada se marca como cliente', () => {
    const marcados = archivosFuente(/^app\/.*(layout|page)\.tsx$/).filter((ruta) =>
      /^'use client';/.test(leer(ruta)),
    );
    expect(marcados).toEqual([]);
  });
});
