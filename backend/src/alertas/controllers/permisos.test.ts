import { RequestMethod, UnauthorizedException } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import type { CommandBus, QueryBus } from '@nestjs/cqrs';
import { METADATO_ROLES } from '../../shared/auth/decoradores';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { AtenderAlerta } from '../commands/impl/atender-alerta.command';
import { RegistrarDemandaDeEstacion } from '../commands/impl/registrar-demanda-de-estacion.command';
import { RegistrarOcupacionDeBus } from '../commands/impl/registrar-ocupacion-de-bus.command';
import { ListarAlertas } from '../queries/impl/listar-alertas.query';
import { ListarBusesParaLectura } from '../queries/impl/listar-buses-para-lectura.query';
import { ObtenerHuellaDeAlertas } from '../queries/impl/obtener-huella-de-alertas.query';
import { AlertasController } from './alertas.controller';
import { LecturasController } from './lecturas.controller';

type Controlador = abstract new (...argumentos: never[]) => object;

interface Ruta {
  metodo: string;
  ruta: string;
  roles: unknown;
}

function rutas(controlador: Controlador): Ruta[] {
  const prototipo = controlador.prototype as Record<string, unknown>;
  return Object.getOwnPropertyNames(prototipo)
    .filter((nombre) => nombre !== 'constructor')
    .map((nombre) => {
      const manejador = prototipo[nombre] as object;
      const metodo = Reflect.getMetadata(METHOD_METADATA, manejador) as RequestMethod;
      return {
        metodo: RequestMethod[metodo],
        ruta: Reflect.getMetadata(PATH_METADATA, manejador) as string,
        roles: Reflect.getMetadata(METADATO_ROLES, manejador) as unknown,
      };
    });
}

const OPERADOR = ['OPERADOR_ESTACION'];

describe('permisos de las alertas', () => {
  it('registrar lecturas y atender exigen operador: supervisor y administrador solo consultan', () => {
    expect(rutas(LecturasController)).toEqual([
      { metodo: 'POST', ruta: 'demandas', roles: OPERADOR },
      { metodo: 'POST', ruta: 'ocupaciones', roles: OPERADOR },
      { metodo: 'GET', ruta: 'opciones/buses', roles: OPERADOR },
    ]);
    expect(rutas(AlertasController)).toEqual([
      { metodo: 'GET', ruta: '/', roles: undefined },
      { metodo: 'GET', ruta: 'huella', roles: undefined },
      { metodo: 'GET', ruta: 'opciones', roles: ['SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'] },
      { metodo: 'PUT', ruta: ':id/atencion', roles: OPERADOR },
    ]);
  });

  it('ninguna ruta de escritura admite al supervisor ni al administrador', () => {
    const escrituras = [...rutas(LecturasController), ...rutas(AlertasController)].filter(
      (ruta) => ruta.metodo === 'POST' || ruta.metodo === 'PUT',
    );

    expect(escrituras).toHaveLength(3);
    escrituras.forEach((ruta) => {
      expect(ruta.roles).toEqual(OPERADOR);
    });
  });
});

function sesion(rol: UsuarioSesion['rol'], estacionId: number | null): UsuarioSesion {
  return { id: 9, nombre: 'Ana', correo: 'ana@x', rol, estacionId };
}

function preparar(): {
  alertas: AlertasController;
  lecturas: LecturasController;
  consultas: jest.Mock;
  comandos: jest.Mock;
} {
  const consultas = jest.fn().mockResolvedValue({});
  const comandos = jest.fn().mockResolvedValue(null);
  const bus = { execute: consultas } as unknown as QueryBus;
  const buscomandos = { execute: comandos } as unknown as CommandBus;
  return {
    alertas: new AlertasController(buscomandos, bus),
    lecturas: new LecturasController(buscomandos, bus),
    consultas,
    comandos,
  };
}

describe('alcance por rol', () => {
  it('el operador consulta siempre su estación, aunque el cliente pida otra', async () => {
    const { alertas, consultas } = preparar();

    await alertas.listar(
      { estacionId: 99, lineaId: 2, estado: 'pendiente' },
      sesion('OPERADOR_ESTACION', 3),
    );

    const [[consulta]] = consultas.mock.calls as [[ListarAlertas]];
    expect(consulta).toBeInstanceOf(ListarAlertas);
    expect(consulta.filtros).toEqual({
      estacionId: 3,
      lineaId: 2,
      estado: 'pendiente',
      tipo: undefined,
    });
  });

  it('el operador recibe su estación aunque no pida ninguna', async () => {
    const { alertas, consultas } = preparar();

    await alertas.listar({}, sesion('OPERADOR_ESTACION', 3));

    expect((consultas.mock.calls as [[ListarAlertas]])[0][0].filtros.estacionId).toBe(3);
  });

  it('la huella del operador también se limita a su estación', async () => {
    const { alertas, consultas } = preparar();

    await alertas.huella({ estacionId: 99 }, sesion('OPERADOR_ESTACION', 3));

    const [[consulta]] = consultas.mock.calls as [[ObtenerHuellaDeAlertas]];
    expect(consulta).toBeInstanceOf(ObtenerHuellaDeAlertas);
    expect(consulta.estacionId).toBe(3);
  });

  it.each(['SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'] as const)(
    '%s ve toda la red y filtra por la estación que pida',
    async (rol) => {
      const { alertas, consultas } = preparar();

      await alertas.listar({}, sesion(rol, null));
      await alertas.listar({ estacionId: 5 }, sesion(rol, null));
      await alertas.huella({}, sesion(rol, null));

      const [[todas], [una], [huella]] = consultas.mock.calls as [
        [ListarAlertas],
        [ListarAlertas],
        [ObtenerHuellaDeAlertas],
      ];
      expect(todas.filtros.estacionId).toBeUndefined();
      expect(una.filtros.estacionId).toBe(5);
      expect(huella.estacionId).toBeUndefined();
    },
  );

  it('el operador sin estación no consulta nada', () => {
    const { alertas, consultas } = preparar();

    expect(() => alertas.listar({}, sesion('OPERADOR_ESTACION', null))).toThrow(
      expect.objectContaining({ codigo: 'ESTACION_AJENA' }) as Error,
    );
    expect(consultas).not.toHaveBeenCalled();
  });

  it('las opciones de buses salen de la estación de la sesión', async () => {
    const { lecturas, consultas } = preparar();

    await lecturas.listarBuses(sesion('OPERADOR_ESTACION', 3));

    const [[consulta]] = consultas.mock.calls as [[ListarBusesParaLectura]];
    expect(consulta.estacionId).toBe(3);
  });

  it('sin sesión no hay consulta ni escritura', async () => {
    const { alertas, lecturas, comandos, consultas } = preparar();

    expect(() => alertas.listar({}, undefined)).toThrow(UnauthorizedException);
    expect(() => lecturas.listarBuses(undefined)).toThrow(UnauthorizedException);
    await expect(alertas.atender(1, undefined)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(comandos).not.toHaveBeenCalled();
    expect(consultas).not.toHaveBeenCalled();
  });
});

describe('las escrituras usan la estación y el id de la sesión', () => {
  it('la demanda y la ocupación llevan la estación del actor, y una cifra vacía llega como null', async () => {
    const { lecturas, comandos } = preparar();
    comandos.mockResolvedValueOnce(12).mockResolvedValueOnce(null);

    const demanda = await lecturas.registrarDemanda(
      { estacionId: 3, busId: 7, pasajeros: 150 },
      sesion('OPERADOR_ESTACION', 3),
    );
    const ocupacion = await lecturas.registrarOcupacion(
      { estacionId: 3, busId: 7 },
      sesion('OPERADOR_ESTACION', 3),
    );

    expect(demanda).toEqual({ alertaId: 12 });
    expect(ocupacion).toEqual({ alertaId: null });
    expect(comandos.mock.calls[0]).toEqual([new RegistrarDemandaDeEstacion(3, 7, 150, 3, 9)]);
    expect(comandos.mock.calls[1]).toEqual([new RegistrarOcupacionDeBus(3, 7, null, 3, 9)]);
  });

  it('atender lleva el id de la alerta, la estación y el usuario de la sesión', async () => {
    const { alertas, comandos } = preparar();

    await alertas.atender(5, sesion('OPERADOR_ESTACION', 3));

    expect(comandos.mock.calls[0]).toEqual([new AtenderAlerta(5, 3, 9)]);
  });
});
