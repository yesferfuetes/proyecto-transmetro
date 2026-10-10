import { Query } from '@nestjs/cqrs';
import type { UsuarioResumen } from '../../../shared/contratos/usuarios';

export class ObtenerUsuariosResumen extends Query<UsuarioResumen[]> {
  constructor(readonly ids: readonly number[]) {
    super();
  }
}
