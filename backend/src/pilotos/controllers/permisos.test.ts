import { RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import type { CommandBus, QueryBus } from '@nestjs/cqrs';
import { METADATO_ROLES } from '../../shared/auth/decoradores';
import type { Rol } from '../../shared/auth/rol';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { ListarPilotos } from '../queries/impl/listar-pilotos.query';
import { ObtenerPiloto } from '../queries/impl/obtener-piloto.query';
import { PilotosController } from './pilotos.controller';

interface Ruta {
  metodo: string;
  ruta: string;
  roles: unknown;
}

function rutas(): Ruta[] {
  const prototipo = PilotosController.prototype as unknown as Record<string, unknown>;
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

const SUPERVISOR = ['SUPERVISOR_MUNICIPAL'];

function sesion(rol: Rol): UsuarioSesion {
  return { id: 1, nombre: 'Ana', correo: 'ana@transmetro.gt', rol, estacionId: null };
}

const REDUCIDO = {
  id: 1,
  nombre: 'Carlos',
  telefono: '5555-1234',
  bus: null,
  linea: null,
  busDeBaja: false,
};

function preparar(): { controlador: PilotosController; consultas: jest.Mock } {
  const consultas = jest.fn();
  const controlador = new PilotosController(
    { execute: jest.fn() } as unknown as CommandBus,
    { execute: consultas } as unknown as QueryBus,
  );
  return { controlador, consultas };
}

describe('permisos de pilotos', () => {
  it('registrar, editar y asignar bus exigen supervisor; las lecturas solo sesión', () => {
    expect(rutas()).toEqual([
      { metodo: 'GET', ruta: '/', roles: undefined },
      { metodo: 'GET', ruta: 'opciones', roles: undefined },
      { metodo: 'GET', ruta: ':id', roles: undefined },
      { metodo: 'POST', ruta: '/', roles: SUPERVISOR },
      { metodo: 'PATCH', ruta: ':id', roles: SUPERVISOR },
      { metodo: 'PUT', ruta: ':id/bus', roles: SUPERVISOR },
    ]);
  });

  it('las opciones se declaran antes que :id', () => {
    const rutasEnOrden = rutas().map(({ ruta }) => ruta);

    expect(rutasEnOrden.indexOf('opciones')).toBeLessThan(rutasEnOrden.indexOf(':id'));
  });
});

describe('vista según el rol', () => {
  it.each<[Rol, boolean]>([
    ['OPERADOR_ESTACION', false],
    ['SUPERVISOR_MUNICIPAL', true],
    ['ADMINISTRADOR', true],
  ])('el listado de %s pide completo=%p', async (rol, completo) => {
    const { controlador, consultas } = preparar();
    consultas.mockResolvedValue({ elementos: [], total: 0, pagina: 1, tamano: 25 });

    await controlador.listar({}, sesion(rol));

    const consulta = (consultas.mock.calls[0] as [ListarPilotos])[0];
    expect(consulta).toBeInstanceOf(ListarPilotos);
    expect(consulta.completo).toBe(completo);
  });

  it.each<[Rol, boolean]>([
    ['OPERADOR_ESTACION', false],
    ['SUPERVISOR_MUNICIPAL', true],
    ['ADMINISTRADOR', true],
  ])('la ficha de %s pide completo=%p', async (rol, completo) => {
    const { controlador, consultas } = preparar();
    consultas.mockResolvedValue(REDUCIDO);

    await controlador.obtener(1, sesion(rol));

    const consulta = (consultas.mock.calls[0] as [ObtenerPiloto])[0];
    expect(consulta).toBeInstanceOf(ObtenerPiloto);
    expect(consulta.completo).toBe(completo);
  });

  it('sin sesión se pide la vista reducida', async () => {
    const { controlador, consultas } = preparar();
    consultas.mockResolvedValue(REDUCIDO);

    await controlador.obtener(1, undefined);

    expect((consultas.mock.calls[0] as [ObtenerPiloto])[0].completo).toBe(false);
  });

  it('el operador recibe la ficha reducida sin ningún campo personal', async () => {
    const { controlador, consultas } = preparar();
    consultas.mockResolvedValue(REDUCIDO);

    const ficha = await controlador.obtener(1, sesion('OPERADOR_ESTACION'));

    for (const campo of ['dpi', 'direccionResidencia', 'correo', 'historialEducativo']) {
      expect(ficha).not.toHaveProperty(campo);
    }
  });

  it('el listado del operador no filtra por DPI aunque se lo pida', async () => {
    const { controlador, consultas } = preparar();
    consultas.mockResolvedValue({ elementos: [REDUCIDO], total: 1, pagina: 1, tamano: 25 });

    const pagina = await controlador.listar(
      { busqueda: '1234567890101' },
      sesion('OPERADOR_ESTACION'),
    );

    expect((consultas.mock.calls[0] as [ListarPilotos])[0].completo).toBe(false);
    expect(pagina.elementos[0]).not.toHaveProperty('dpi');
  });

  it('una ficha inexistente responde PILOTO_NO_EXISTE', async () => {
    const { controlador, consultas } = preparar();
    consultas.mockResolvedValue(null);

    await expect(controlador.obtener(99, sesion('SUPERVISOR_MUNICIPAL'))).rejects.toMatchObject({
      codigo: 'PILOTO_NO_EXISTE',
    });
  });
});
