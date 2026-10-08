import { Query } from '@nestjs/cqrs';
import type { UsuarioSesion } from '../../../shared/auth/usuario-sesion';

/** Devuelve el usuario tal como está ahora, o `null` si no existe o está desactivado. */
export class ObtenerUsuarioDeSesion extends Query<UsuarioSesion | null> {
  constructor(readonly id: number) {
    super();
  }
}
