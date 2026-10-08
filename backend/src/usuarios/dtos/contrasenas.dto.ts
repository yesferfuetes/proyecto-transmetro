import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** La política de la contraseña nueva la valida el command, que responde su propio código. */
export class CambiarMiContrasenaDto {
  @ApiProperty({ maxLength: 128, format: 'password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  contrasenaActual!: string;

  @ApiProperty({
    maxLength: 128,
    format: 'password',
    description: 'Al menos 8 caracteres, con al menos una letra y un número.',
  })
  @IsString()
  @MaxLength(128)
  contrasenaNueva!: string;
}

export class AsignarContrasenaDto {
  @ApiProperty({
    maxLength: 128,
    format: 'password',
    description: 'Al menos 8 caracteres, con al menos una letra y un número.',
  })
  @IsString()
  @MaxLength(128)
  contrasena!: string;
}
