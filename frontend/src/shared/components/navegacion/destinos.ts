import type { NombreIcono } from '@/shared/components/utilidades';

export type Destino = Readonly<{
  href: string;
  etiqueta: string;
  icono: NombreIcono;
  /** Roles que ven el destino. La matriz la decide el módulo de usuarios. */
  roles: readonly string[];
}>;

/** Destinos que el rol puede ver, en el mismo orden. Menú y mosaicos salen de esta lista. */
export function destinosPermitidos(destinos: readonly Destino[], rol: string): Destino[] {
  return destinos.filter((destino) => destino.roles.includes(rol));
}

/**
 * Reparte los destinos de la barra inferior: caben `visibles` más el botón "Más". Si todos caben
 * sin ese botón y no se pide `conMas`, no se agrega.
 */
export function particionarNavegacion(
  destinos: readonly Destino[],
  visibles = 4,
  conMas = false,
): { visibles: Destino[]; mas: Destino[] } {
  if (!conMas && destinos.length <= visibles + 1) {
    return { visibles: [...destinos], mas: [] };
  }
  return { visibles: destinos.slice(0, visibles), mas: destinos.slice(visibles) };
}

/** Un destino está activo en su ruta y en las rutas que cuelgan de ella. */
export function estaActivo(ruta: string, href: string): boolean {
  return ruta === href || ruta.startsWith(`${href}/`);
}
