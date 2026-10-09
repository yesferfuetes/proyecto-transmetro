import { Query } from '@nestjs/cqrs';
import type { ParqueoEnVista } from './listar-parqueos.query';

export class ObtenerParqueo extends Query<ParqueoEnVista | null> {
  constructor(readonly id: number) {
    super();
  }
}
