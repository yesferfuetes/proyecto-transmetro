import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { Recortar } from './transformaciones';

export class RegistrarParqueoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  estacionId!: number;

  @ApiProperty({ maxLength: 10, example: 'P1' })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  codigo!: string;

  @ApiProperty({ minimum: 1, example: 30 })
  @IsInt()
  capacidadVehiculos!: number;
}

export class EditarParqueoDto {
  @ApiProperty({ minimum: 1, example: 30 })
  @IsInt()
  capacidadVehiculos!: number;
}

export class EstacionDeParqueoDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
}

export class ParqueoDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() capacidadVehiculos!: number;
  @ApiProperty() buses!: number;
  @ApiProperty({ type: EstacionDeParqueoDto }) estacion!: EstacionDeParqueoDto;
}
