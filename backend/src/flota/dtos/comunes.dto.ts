import { ApiProperty } from '@nestjs/swagger';
import { ESTADOS_DE_BUS } from '../services/estados-de-bus';

export class IdCreadoDto {
  @ApiProperty({ example: 1 })
  id!: number;
}

export const ESTADOS_DE_BUS_DOCUMENTADOS = [...ESTADOS_DE_BUS];
