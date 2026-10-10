import { Injectable } from '@nestjs/common';
import { ConsultasDeUsuarios, UsuarioResumen } from '../../../shared/contratos/usuarios';

/** Lo que las alertas necesitan de los usuarios. Es la única puerta de este módulo hacia ellos. */
@Injectable()
export class UsuariosAdapter {
  constructor(private readonly usuarios: ConsultasDeUsuarios) {}

  obtenerUsuarios(ids: readonly number[]): Promise<UsuarioResumen[]> {
    return this.usuarios.obtenerUsuarios(ids);
  }
}
