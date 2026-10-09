import { ApiProperty } from '@nestjs/swagger';

const ESTADOS_DE_FLOTA = ['completa', 'insuficiente', 'excedida'];
const ESTADOS_DE_LINEA = ['ACTIVA', 'INACTIVA', 'EN_CONSTRUCCION'];

export class LineaDeFlotaDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ enum: ESTADOS_DE_LINEA }) estado!: string;
}

export class FlotaDeLineaDto {
  @ApiProperty({ type: LineaDeFlotaDto }) linea!: LineaDeFlotaDto;
  @ApiProperty() estaciones!: number;
  @ApiProperty() minimo!: number;
  @ApiProperty() maximo!: number;
  @ApiProperty() buses!: number;
  @ApiProperty({ enum: ESTADOS_DE_FLOTA }) estadoDeFlota!: string;
}

export class OpcionDeLineaDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty() estaciones!: number;
  @ApiProperty() buses!: number;
  @ApiProperty() maximo!: number;
}

export class OpcionDeParqueoDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() capacidadVehiculos!: number;
  @ApiProperty() buses!: number;
  @ApiProperty() estacion!: { id: number; codigo: string; nombre: string };
}

export class OpcionDeEstacionDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty() tieneParqueo!: boolean;
}
