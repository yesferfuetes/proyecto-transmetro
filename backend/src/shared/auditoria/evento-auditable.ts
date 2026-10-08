import type { IEvent } from '@nestjs/cqrs';

export type ResumenAuditable = Readonly<Record<string, string | number | boolean | null>>;

/**
 * Aviso de un cambio de estado que debe quedar en la auditoría. Cada módulo lo extiende y lo publica
 * después de confirmar su transacción. Nunca lleva contraseñas.
 */
export abstract class EventoAuditable implements IEvent {
  protected constructor(
    readonly usuarioId: number | null,
    readonly accion: string,
    readonly entidad: string,
    readonly entidadId: string | null,
    readonly resumen: ResumenAuditable = {},
    readonly correoIntentado: string | null = null,
  ) {}
}

export function esEventoAuditable(evento: IEvent): evento is EventoAuditable {
  return evento instanceof EventoAuditable;
}
