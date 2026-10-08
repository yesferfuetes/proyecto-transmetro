import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { ResumenAuditable } from '../../../shared/auditoria/evento-auditable';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Auditoria } from '../../entities/auditoria.entity';
import { RegistrarAuditoria } from '../impl/registrar-auditoria.command';

/** Claves que nunca se guardan en el resumen, aunque un módulo las envíe por error. */
const CLAVE_PROHIBIDA = /contrasena|contraseña|password|hash/i;

/** Transcribe el aviso tal como llega. No publica eventos, para no entrar en un ciclo. */
@CommandHandler(RegistrarAuditoria)
export class RegistrarAuditoriaHandler implements ICommandHandler<RegistrarAuditoria> {
  constructor(private readonly unidadDeTrabajo: UnidadDeTrabajo) {}

  async execute({ evento }: RegistrarAuditoria): Promise<void> {
    await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      await contexto.repositorio(Auditoria).insert({
        usuarioId: evento.usuarioId,
        correoIntentado: evento.correoIntentado,
        accion: evento.accion,
        entidad: evento.entidad,
        entidadId: evento.entidadId,
        resumen: JSON.stringify(depurar(evento.resumen)),
      });
    });
  }
}

function depurar(resumen: ResumenAuditable): ResumenAuditable {
  return Object.fromEntries(
    Object.entries(resumen).filter(([clave]) => !CLAVE_PROHIBIDA.test(clave)),
  );
}
