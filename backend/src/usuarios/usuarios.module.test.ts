import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationConfig } from '@nestjs/core';
import { CommandBus, CqrsModule, EventBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UnidadDeTrabajoSimulada } from '../../test/utilidades/unidad-de-trabajo-simulada';
import { ConsultasDeRed } from '../shared/contratos/red';
import { UnidadDeTrabajo } from '../shared/database/unidad-de-trabajo';
import { RegistrarAuditoria } from './commands/impl/registrar-auditoria.command';
import { UsuarioDesactivado } from './events/eventos-de-usuarios';
import { EmisorDeTokens } from './services/emisor-de-tokens.service';
import { VerificadorDeSesionGuard } from './strategies/verificador-de-sesion.guard';
import { UsuariosModule } from './usuarios.module';

/** Lo que en la aplicación dan la base de datos, el núcleo y el módulo de la red. */
@Global()
@Module({
  providers: [
    {
      provide: DataSource,
      useValue: { options: {}, entityMetadatas: [], getRepository: (): object => ({}) },
    },
    { provide: UnidadDeTrabajo, useClass: UnidadDeTrabajoSimulada },
    { provide: ConsultasDeRed, useValue: {} },
  ],
  exports: [DataSource, UnidadDeTrabajo, ConsultasDeRed],
})
class InfraestructuraSimulada {}

describe('UsuariosModule', () => {
  let modulo: TestingModule;

  beforeAll(async () => {
    modulo = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [(): object => ({ JWT_SECRETO: 'secreto-de-prueba-con-mas-de-32-caracteres' })],
        }),
        CqrsModule.forRoot(),
        InfraestructuraSimulada,
        UsuariosModule,
      ],
    }).compile();
    await modulo.init();
  });

  afterAll(async () => {
    await modulo.close();
  });

  it('resuelve sus dependencias y registra el guard de sesión como global', () => {
    const guards = modulo.get(ApplicationConfig).getGlobalGuards();
    expect(guards.some((guard) => guard instanceof VerificadorDeSesionGuard)).toBe(true);
  });

  it('firma los tokens con el secreto de la configuración', () => {
    const emisor = modulo.get(EmisorDeTokens);
    expect(emisor.verificar(emisor.emitir(5).token)).toEqual({ usuarioId: 5 });
  });

  it('al iniciar, deja suscrito el registro de auditoría al bus de eventos', async () => {
    const ejecutar = jest.spyOn(modulo.get(CommandBus), 'execute').mockResolvedValue(undefined);
    const evento = new UsuarioDesactivado(1, 9);

    modulo.get(EventBus).publish(evento);
    await new Promise((resolver) => setImmediate(resolver));

    expect(ejecutar).toHaveBeenCalledWith(new RegistrarAuditoria(evento));
  });
});
