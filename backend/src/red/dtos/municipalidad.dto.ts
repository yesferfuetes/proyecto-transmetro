import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { presenteSiViene, Recortar } from './transformaciones';

export class RegistrarMunicipalidadDto {
  @ApiProperty({ maxLength: 150, example: 'Mixco' })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ maxLength: 100, nullable: true, example: 'Guatemala' })
  @IsOptional()
  @Recortar()
  @IsString()
  @MaxLength(100)
  departamento?: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true, example: '2026-01-15' })
  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  fechaIncorporacion?: string | null;
}

export class EditarMunicipalidadDto {
  @ApiPropertyOptional({ maxLength: 150, example: 'Mixco' })
  @ValidateIf(presenteSiViene)
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ maxLength: 100, nullable: true, description: 'null lo quita.' })
  @IsOptional()
  @Recortar()
  @IsString()
  @MaxLength(100)
  departamento?: string | null;

  @ApiPropertyOptional({ format: 'date', nullable: true, description: 'null la quita.' })
  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  fechaIncorporacion?: string | null;
}

export class MunicipalidadDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: String, nullable: true }) departamento!: string | null;
  @ApiProperty({ type: String, format: 'date', nullable: true }) fechaIncorporacion!: string | null;
}

export class MunicipalidadEnListadoDto extends MunicipalidadDto {
  @ApiProperty() numeroDeLineas!: number;
  @ApiProperty() numeroDeEstaciones!: number;
  @ApiProperty({ description: 'Sin líneas ni estaciones.' }) sinRed!: boolean;
}

export class PaginaDeMunicipalidadesDto {
  @ApiProperty({ type: [MunicipalidadEnListadoDto] }) elementos!: MunicipalidadEnListadoDto[];
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
}
