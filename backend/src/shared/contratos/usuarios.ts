export interface UsuarioResumen {
  id: number;
  nombre: string;
  correo: string;
}

/**
 * Lo que los demás módulos pueden consultar de los usuarios. La implementa el módulo de usuarios y
 * la exporta como proveedor global; los demás la usan desde un adapter propio.
 */
export abstract class ConsultasDeUsuarios {
  /** Solo los usuarios que existen, activos o no, ordenados por id. */
  abstract obtenerUsuarios(ids: readonly number[]): Promise<UsuarioResumen[]>;
}
