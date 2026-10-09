import { Query } from '@nestjs/cqrs';

export class EstacionTieneParqueos extends Query<boolean> {
  constructor(readonly estacionId: number) {
    super();
  }
}
