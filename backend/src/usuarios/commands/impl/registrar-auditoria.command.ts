import { Command } from '@nestjs/cqrs';
import type { EventoAuditable } from '../../../shared/auditoria/evento-auditable';

/** Transcribe un aviso de cambio a la auditoría. */
export class RegistrarAuditoria extends Command<void> {
  constructor(readonly evento: EventoAuditable) {
    super();
  }
}
