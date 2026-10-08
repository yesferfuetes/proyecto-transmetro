import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { QueryBus } from '@nestjs/cqrs';
import { Publico, Roles } from '../../shared/auth/decoradores';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { ObtenerUsuarioDeSesion } from '../queries/impl/obtener-usuario-de-sesion.query';
import type { EmisorDeTokens, VerificacionDeToken } from '../services/emisor-de-tokens.service';
import { VerificadorDeSesionGuard } from './verificador-de-sesion.guard';

@Publico()
class ControladorPublico {
  ruta(): void {}
}

class ControladorConSesion {
  ruta(): void {}

  @Roles('ADMINISTRADOR')
  soloAdministrador(): void {}

  @Publico()
  rutaPublica(): void {}
}

@Roles('ADMINISTRADOR', 'SUPERVISOR_MUNICIPAL')
class ControladorDeSupervision {
  ruta(): void {}
}

interface SolicitudDePrueba {
  headers: { authorization?: string };
  usuario?: UsuarioSesion;
}

const OPERADOR: UsuarioSesion = {
  id: 7,
  nombre: 'Luis',
  correo: 'luis@muni.gt',
  rol: 'OPERADOR_ESTACION',
  estacionId: 3,
};

function contexto(
  clase: new () => object,
  metodo: string,
  solicitud: SolicitudDePrueba,
): ExecutionContext {
  const manejador = (clase.prototype as Record<string, () => void>)[metodo];
  return {
    getHandler: () => manejador,
    getClass: () => clase,
    switchToHttp: () => ({ getRequest: () => solicitud }),
  } as unknown as ExecutionContext;
}

describe('VerificadorDeSesionGuard', () => {
  let verificar: jest.Mock<VerificacionDeToken, [string]>;
  let consultar: jest.Mock;
  let guard: VerificadorDeSesionGuard;

  beforeEach(() => {
    verificar = jest.fn<VerificacionDeToken, [string]>().mockReturnValue({ usuarioId: 7 });
    consultar = jest.fn().mockResolvedValue(OPERADOR);
    guard = new VerificadorDeSesionGuard(
      new Reflector(),
      { verificar } as unknown as EmisorDeTokens,
      { execute: consultar } as unknown as QueryBus,
    );
  });

  function conToken(token = 'token-valido'): SolicitudDePrueba {
    return { headers: { authorization: `Bearer ${token}` } };
  }

  it('deja pasar un controlador marcado como público a nivel de clase sin pedir token', async () => {
    await expect(
      guard.canActivate(contexto(ControladorPublico, 'ruta', { headers: {} })),
    ).resolves.toBe(true);
    expect(verificar).not.toHaveBeenCalled();
  });

  it('deja pasar un método marcado como público', async () => {
    await expect(
      guard.canActivate(contexto(ControladorConSesion, 'rutaPublica', { headers: {} })),
    ).resolves.toBe(true);
  });

  it.each([undefined, '', 'Basic abc', 'Bearer'])(
    'sin token Bearer (%s) rechaza con NO_AUTENTICADO',
    async (encabezado) => {
      const solicitud = { headers: { authorization: encabezado } };

      await expect(
        guard.canActivate(contexto(ControladorConSesion, 'ruta', solicitud)),
      ).rejects.toMatchObject({ codigo: 'NO_AUTENTICADO' });
      expect(consultar).not.toHaveBeenCalled();
    },
  );

  it('con un token inválido rechaza con NO_AUTENTICADO', async () => {
    verificar.mockReturnValue('invalido');

    await expect(
      guard.canActivate(contexto(ControladorConSesion, 'ruta', conToken())),
    ).rejects.toMatchObject({ codigo: 'NO_AUTENTICADO' });
  });

  it('con un token vencido rechaza con SESION_EXPIRADA sin consultar al usuario', async () => {
    verificar.mockReturnValue('vencido');

    await expect(
      guard.canActivate(contexto(ControladorConSesion, 'ruta', conToken())),
    ).rejects.toMatchObject({ codigo: 'SESION_EXPIRADA' });
    expect(consultar).not.toHaveBeenCalled();
  });

  it('con un usuario desactivado o inexistente rechaza con SESION_EXPIRADA', async () => {
    consultar.mockResolvedValue(null);

    await expect(
      guard.canActivate(contexto(ControladorConSesion, 'ruta', conToken())),
    ).rejects.toMatchObject({ codigo: 'SESION_EXPIRADA' });
    expect(consultar).toHaveBeenCalledWith(new ObtenerUsuarioDeSesion(7));
  });

  it('deja en la solicitud el usuario recién leído, con su rol y estación vigentes', async () => {
    const solicitud = conToken('abc.def.ghi');
    const cambiado = { ...OPERADOR, estacionId: 4 };
    consultar.mockResolvedValue(cambiado);

    await expect(
      guard.canActivate(contexto(ControladorConSesion, 'ruta', solicitud)),
    ).resolves.toBe(true);
    expect(verificar).toHaveBeenCalledWith('abc.def.ghi');
    expect(solicitud.usuario).toEqual(cambiado);
  });

  it('con un rol sin permiso en el método rechaza con ACCESO_DENEGADO', async () => {
    await expect(
      guard.canActivate(contexto(ControladorConSesion, 'soloAdministrador', conToken())),
    ).rejects.toMatchObject({ codigo: 'ACCESO_DENEGADO' });
  });

  it('con un rol sin permiso en la clase rechaza con ACCESO_DENEGADO', async () => {
    await expect(
      guard.canActivate(contexto(ControladorDeSupervision, 'ruta', conToken())),
    ).rejects.toMatchObject({ codigo: 'ACCESO_DENEGADO' });
  });

  it('con un rol permitido deja pasar', async () => {
    consultar.mockResolvedValue({ ...OPERADOR, rol: 'SUPERVISOR_MUNICIPAL', estacionId: null });

    await expect(
      guard.canActivate(contexto(ControladorDeSupervision, 'ruta', conToken())),
    ).resolves.toBe(true);
  });
});
