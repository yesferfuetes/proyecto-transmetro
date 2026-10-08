import { ApiProperty } from '@nestjs/swagger';
import { ESTADOS_DE_LINEA } from '../services/estados-de-linea';

export class IdCreadoDto {
  @ApiProperty({ example: 1 })
  id!: number;
}

export class ReferenciaDeMunicipalidadDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
}

export const ESTADOS_DOCUMENTADOS = [...ESTADOS_DE_LINEA];
