import { Logger } from '@nestjs/common';
import type { CommandBus, EventBus, IEvent } from '@nestjs/cqrs';
import { Subject } from 'rxjs';
import { RegistrarAuditoria } from '../../commands/impl/registrar-auditoria.command';
import { UsuarioDesactivado } from '../eventos-de-usuarios';
import { RegistradorDeAuditoria } from './registrador-de-auditoria';

class EventoNoAuditable implements IEvent {}

async function vaciarTareasPendientes(): Promise<void> {
  await new Promise((resolver) => setImmediate(resolver));
}

describe('RegistradorDeAuditoria', () => {
  let bus: Subject<IEvent>;
  let ejecutar: jest.Mock;
  let registrador: RegistradorDeAuditoria;

  beforeEach(() => {
    bus = new Subject<IEvent>();
    ejecutar = jest.fn().mockResolvedValue(undefined);
    registrador = new RegistradorDeAuditoria(
      bus as unknown as EventBus,
      { execute: ejecutar } as unknown as CommandBus,
    );
    registrador.onModuleInit();
  });

  afterEach(() => {
    registrador.onModuleDestroy();
    jest.restoreAllMocks();
  });

  it('ejecuta el command de auditoría para un evento auditable', async () => {
    const evento = new UsuarioDesactivado(1, 9);

    bus.next(evento);
    await vaciarTareasPendientes();

    expect(ejecutar).toHaveBeenCalledWith(new RegistrarAuditoria(evento));
  });

  it('ignora los eventos que no son auditables', async () => {
    bus.next(new EventoNoAuditable());
    await vaciarTareasPendientes();

    expect(ejecutar).not.toHaveBeenCalled();
  });

  it('un fallo del command no se propaga: queda en el log sin datos personales', async () => {
    const registrar = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    ejecutar.mockRejectedValueOnce(new Error('la base no responde'));

    bus.next(new UsuarioDesactivado(1, 9));
    await vaciarTareasPendientes();
    bus.next(new UsuarioDesactivado(1, 10));
    await vaciarTareasPendientes();

    expect(registrar).toHaveBeenCalledTimes(1);
    expect(registrar.mock.calls[0]?.[0]).toContain('USUARIO_DESACTIVADO');
    expect(ejecutar).toHaveBeenCalledTimes(2);
  });

  it('deja de escuchar al destruirse el módulo', async () => {
    registrador.onModuleDestroy();

    bus.next(new UsuarioDesactivado(1, 9));
    await vaciarTareasPendientes();

    expect(ejecutar).not.toHaveBeenCalled();
  });
});
