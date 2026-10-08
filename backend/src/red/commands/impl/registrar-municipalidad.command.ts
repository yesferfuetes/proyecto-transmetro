import { Command } from '@nestjs/cqrs';

export class RegistrarMunicipalidad extends Command<number> {
  constructor(
    readonly nombre: string,
    readonly departamento: string | null,
    readonly fechaIncorporacion: string | null,
    readonly actorId: number,
  ) {
    super();
  }
}
