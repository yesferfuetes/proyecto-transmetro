import { ApiProperty } from '@nestjs/swagger';

export class IdCreadoDto {
  @ApiProperty({ example: 1 })
  id!: number;
}

export class ReferenciaDeEstacionDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
}
