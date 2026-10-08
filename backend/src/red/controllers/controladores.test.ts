import { ArgumentMetadata, UnauthorizedException } from '@nestjs/common';
import type { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { crearTuboDeValidacion } from '../../shared/errors/tubo-de-validacion';
import { DefinirRecorridoDeLinea } from '../commands/impl/definir-recorrido-de-linea.command';
import { RegistrarEstacion } from '../commands/impl/registrar-estacion.command';
import { EditarEstacionDto, FiltrosDeEstacionesDto } from '../dtos/estacion.dto';
import { DefinirRecorridoDto } from '../dtos/linea.dto';
import { ListarMunicipalidades } from '../queries/impl/listar-municipalidades.query';
import { EstacionesController } from './estaciones.controller';
import { LineasController } from './lineas.controller';
import { MunicipalidadesController } from './municipalidades.controller';

const SUPERVISOR: UsuarioSesion = {
  id: 7,
  nombre: 'Supervisora',
  correo: 's@transmetro.gt',
  rol: 'SUPERVISOR_MUNICIPAL',
  estacionId: null,
};

interface Buses {
  comandos: { execute: jest.Mock };
  consultas: { execute: jest.Mock };
  args: readonly [CommandBus, QueryBus];
}

function buses(resultado: unknown = undefined): Buses {
  const comandos = { execute: jest.fn().mockResolvedValue(resultado) };
  const consultas = { execute: jest.fn().mockResolvedValue(resultado) };
  return {
    comandos,
    consultas,
    args: [comandos as unknown as CommandBus, consultas as unknown as QueryBus] as const,
  };
}

function validar<T>(
  tipo: new () => T,
  valor: unknown,
  en: ArgumentMetadata['type'] = 'body',
): Promise<T> {
  return crearTuboDeValidacion().transform(valor, { type: en, metatype: tipo }) as Promise<T>;
}

describe('controladores de la red', () => {
  it('el recorrido toma la distancia ausente como nula y lleva al usuario de la sesión', async () => {
    const { comandos, args } = buses();
    const cuerpo = await validar(DefinirRecorridoDto, {
      paradas: [{ estacionId: 1, distanciaSiguienteKm: 1.2 }, { estacionId: 2 }],
    });

    await new LineasController(...args).definirRecorrido(3, cuerpo, SUPERVISOR);

    expect(comandos.execute.mock.calls).toContainEqual([
      new DefinirRecorridoDeLinea(
        3,
        [
          { estacionId: 1, distanciaSiguienteKm: 1.2 },
          { estacionId: 2, distanciaSiguienteKm: null },
        ],
        7,
      ),
    ]);
  });

  it('registrar una estación devuelve el id creado y deja las coordenadas ausentes en null', async () => {
    const { comandos, args } = buses(12);

    const respuesta = await new EstacionesController(...args).registrar(
      { codigo: 'E12', nombre: 'Doce', municipalidadId: 1, tieneParqueo: false },
      SUPERVISOR,
    );

    expect(respuesta).toEqual({ id: 12 });
    expect(comandos.execute.mock.calls).toContainEqual([
      new RegistrarEstacion(
        {
          codigo: 'E12',
          nombre: 'Doce',
          municipalidadId: 1,
          tieneParqueo: false,
          latitud: null,
          longitud: null,
        },
        7,
      ),
    ]);
  });

  it('una escritura sin usuario en la solicitud no llega al command', async () => {
    const { comandos, args } = buses();

    await expect(
      new LineasController(...args).cambiarEstado(1, { estado: 'ACTIVA' }, undefined),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(comandos.execute.mock.calls).toHaveLength(0);
  });

  it.each([
    ['línea', () => new LineasController(...buses(null).args).obtener(9), 'LINEA_NO_EXISTE'],
    [
      'estación',
      () => new EstacionesController(...buses(null).args).obtener(9),
      'ESTACION_NO_EXISTE',
    ],
    [
      'municipalidad',
      () => new MunicipalidadesController(...buses(null).args).obtener(9),
      'MUNICIPALIDAD_NO_EXISTE',
    ],
  ])('pedir una %s inexistente responde no encontrado', async (_caso, pedir, codigo) => {
    await expect(pedir()).rejects.toMatchObject({ codigo, tipo: 'NO_ENCONTRADO' });
  });

  it('los listados usan 25 por página si no se indica', async () => {
    const { consultas, args } = buses({ elementos: [], total: 0, pagina: 1, tamano: 25 });

    await new MunicipalidadesController(...args).listar({});

    expect(consultas.execute.mock.calls).toContainEqual([
      new ListarMunicipalidades({ pagina: 1, tamano: 25 }),
    ]);
  });

  it('rechaza un tamaño de página mayor que 100', async () => {
    await expect(validar(FiltrosDeEstacionesDto, { tamano: '101' }, 'query')).rejects.toMatchObject(
      { codigo: 'ENTRADA_INVALIDA' },
    );
  });

  it('lee el filtro de parqueo de la cadena de consulta como booleano', async () => {
    await expect(
      validar(FiltrosDeEstacionesDto, { tieneParqueo: 'false', pagina: '2' }, 'query'),
    ).resolves.toMatchObject({ tieneParqueo: false, pagina: 2 });
  });

  it('la edición de una estación no acepta el código', async () => {
    await expect(validar(EditarEstacionDto, { codigo: 'E9' })).rejects.toMatchObject({
      codigo: 'ENTRADA_INVALIDA',
    });
  });

  it('la edición rechaza un nombre nulo pero acepta coordenadas nulas', async () => {
    await expect(validar(EditarEstacionDto, { nombre: null })).rejects.toMatchObject({
      codigo: 'ENTRADA_INVALIDA',
    });
    await expect(
      validar(EditarEstacionDto, { latitud: null, longitud: null }),
    ).resolves.toMatchObject({ latitud: null, longitud: null });
  });

  it('un recorrido admite como máximo 200 paradas', async () => {
    const paradas = Array.from({ length: 201 }, (_, indice) => ({ estacionId: indice + 1 }));

    await expect(validar(DefinirRecorridoDto, { paradas })).rejects.toMatchObject({
      codigo: 'ENTRADA_INVALIDA',
    });
  });
});
