import { ApiProperty } from '@nestjs/swagger';
import type { DetalleDeError } from './error-de-negocio';

export class DetalleDeErrorDto implements DetalleDeError {
  @ApiProperty({ example: 'placa' })
  campo!: string;

  @ApiProperty({ example: ['placa must be a string'] })
  mensajes!: string[];
}

/** Forma única de toda respuesta de error del backend. */
export class SobreDeError {
  @ApiProperty({ example: 'FLOTA_MAXIMA_EXCEDIDA' })
  codigo!: string;

  @ApiProperty({ example: 'La línea ya tiene el máximo de buses permitido.' })
  mensaje!: string;

  @ApiProperty({ type: [DetalleDeErrorDto] })
  detalles!: DetalleDeError[];
}
