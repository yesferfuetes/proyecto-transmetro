import { Query } from '@nestjs/cqrs';
import type { UsuarioDetalle } from './vistas';

export class ObtenerUsuario extends Query<UsuarioDetalle> {
  constructor(readonly id: number) {
    super();
  }
}
