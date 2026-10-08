import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CommandBus, EventBus, IEvent } from '@nestjs/cqrs';
import type { Subscription } from 'rxjs';
import { EventoAuditable, esEventoAuditable } from '../../../shared/auditoria/evento-auditable';
import { RegistrarAuditoria } from '../../commands/impl/registrar-auditoria.command';

/**
 * Escucha todos los eventos del bus y deja constancia de los auditables, vengan del módulo que
 * vengan. Un fallo al registrar no deshace el cambio que lo originó: solo queda en el log.
 */
@Injectable()
export class RegistradorDeAuditoria implements OnModuleInit, OnModuleDestroy {
  private readonly registro = new Logger(RegistradorDeAuditoria.name);
  private suscripcion?: Subscription;

  constructor(
    private readonly eventos: EventBus,
    private readonly comandos: CommandBus,
  ) {}

  onModuleInit(): void {
    this.suscripcion = this.eventos.subscribe((evento: IEvent) => {
      if (esEventoAuditable(evento)) {
        void this.registrar(evento);
      }
    });
  }

  onModuleDestroy(): void {
    this.suscripcion?.unsubscribe();
  }

  private async registrar(evento: EventoAuditable): Promise<void> {
    try {
      await this.comandos.execute(new RegistrarAuditoria(evento));
    } catch (error) {
      const causa = error instanceof Error ? error.message : 'causa desconocida';
      this.registro.error(
        `No se pudo registrar en la auditoría la acción ${evento.accion} sobre ${evento.entidad}: ${causa}`,
      );
    }
  }
}
