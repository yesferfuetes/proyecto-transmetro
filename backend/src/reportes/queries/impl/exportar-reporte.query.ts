import { Query } from '@nestjs/cqrs';
import type { ArchivoExportado } from '../../services/exportacion';

export class ExportarReporte extends Query<ArchivoExportado> {
  constructor(
    readonly consultaId: number,
    readonly actorId: number,
  ) {
    super();
  }
}
