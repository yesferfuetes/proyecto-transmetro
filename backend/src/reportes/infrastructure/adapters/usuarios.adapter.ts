import { Injectable } from '@nestjs/common';
import { ConsultasDeUsuarios, UsuarioResumen } from '../../../shared/contratos/usuarios';

/** Lo que los reportes necesitan de los usuarios: nombrar a quien consultó. */
@Injectable()
export class UsuariosAdapter {
  constructor(private readonly usuarios: ConsultasDeUsuarios) {}

  obtenerUsuarios(ids: readonly number[]): Promise<UsuarioResumen[]> {
    return this.usuarios.obtenerUsuarios(ids);
  }
}
