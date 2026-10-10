import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ConsultasDeUsuarios, UsuarioResumen } from '../../../shared/contratos/usuarios';
import { ObtenerUsuariosResumen } from '../../queries/impl/obtener-usuarios-resumen.query';

/** Lo que los usuarios ofrecen a los demás módulos. Nunca lanza por un id inexistente. */
@Injectable()
export class ConsultasDeUsuariosAdapter extends ConsultasDeUsuarios {
  constructor(private readonly consultas: QueryBus) {
    super();
  }

  obtenerUsuarios(ids: readonly number[]): Promise<UsuarioResumen[]> {
    return this.consultas.execute(new ObtenerUsuariosResumen(ids));
  }
}
