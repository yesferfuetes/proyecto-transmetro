import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { ErrorDeEntrada } from './error-de-negocio';
import { crearTuboDeValidacion } from './tubo-de-validacion';

class ParqueoDto {
  @IsString()
  codigo!: string;
}

class BusDto {
  @IsString()
  placa!: string;

  @IsInt()
  capacidadMax!: number;

  @ValidateNested()
  @Type(() => ParqueoDto)
  parqueo!: ParqueoDto;
}

describe('tubo de validación', () => {
  const tubo = crearTuboDeValidacion();
  const metadatos = { type: 'body' as const, metatype: BusDto };

  it('acepta una entrada válida y la transforma a la clase del DTO', async () => {
    const resultado: unknown = await tubo.transform(
      { placa: 'TM-0001', capacidadMax: 90, parqueo: { codigo: 'P1' } },
      metadatos,
    );
    expect(resultado).toBeInstanceOf(BusDto);
  });

  it('rechaza con ENTRADA_INVALIDA y detalla cada campo, incluidos los anidados', async () => {
    const promesa = tubo.transform(
      { placa: 5, capacidadMax: 90, parqueo: { codigo: 1 } },
      metadatos,
    );
    await expect(promesa).rejects.toBeInstanceOf(ErrorDeEntrada);
    await expect(promesa).rejects.toMatchObject({
      codigo: 'ENTRADA_INVALIDA',
      detalles: [
        { campo: 'placa', mensajes: expect.any(Array) as unknown },
        { campo: 'parqueo.codigo', mensajes: expect.any(Array) as unknown },
      ],
    });
  });

  it('rechaza propiedades que el DTO no declara', async () => {
    const promesa = tubo.transform(
      { placa: 'TM-0001', capacidadMax: 90, parqueo: { codigo: 'P1' }, lineaId: 3 },
      metadatos,
    );
    await expect(promesa).rejects.toMatchObject({ detalles: [{ campo: 'lineaId' }] });
  });
});
