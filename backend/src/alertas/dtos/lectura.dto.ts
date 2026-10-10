import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ReferenciaDto } from './alerta.dto';

export class LecturaDto {
  @ApiProperty({ example: 3, description: 'Debe ser la estación de la sesión.' })
  @IsInt()
  @Min(1)
  estacionId!: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  busId!: number;

  @ApiProperty({
    type: Number,
    nullable: true,
    example: 150,
    description: 'Entero desde 0. Si falta o no es entero, responde PASAJEROS_INVALIDOS.',
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  pasajeros?: number | null;
}

export class AlertaCreadaDto {
  @ApiProperty({ type: Number, nullable: true, description: 'null si no corresponde alerta.' })
  alertaId!: number | null;
}

export class BusParaLecturaDto {
  @ApiProperty() id!: number;
  @ApiProperty() placa!: string;
  @ApiProperty() capacidadMax!: number;
  @ApiProperty({ type: ReferenciaDto }) linea!: ReferenciaDto;
}
