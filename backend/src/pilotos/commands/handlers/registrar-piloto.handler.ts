import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import type { Repository } from 'typeorm';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Piloto } from '../../entities/piloto.entity';
import { DpiPilotoDuplicado } from '../../errors/errores-de-pilotos';
import { PilotoRegistrado } from '../../events/eventos-de-pilotos';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { exigirBusAsignable } from '../../services/bus-asignable';
import { esViolacionDeUnicidad } from '../../services/unicidad';
import { DatosDePiloto, validarExpediente } from '../../services/validaciones';
import { RegistrarPiloto } from '../impl/registrar-piloto.command';

@CommandHandler(RegistrarPiloto)
export class RegistrarPilotoHandler implements ICommandHandler<RegistrarPiloto> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly flota: FlotaAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute({ datos, busId, actorId }: RegistrarPiloto): Promise<number> {
    const expediente = validarExpediente(datos);
    const id = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const pilotos = contexto.repositorio(Piloto);
      if (await pilotos.existsBy({ dpi: expediente.dpi })) {
        throw new DpiPilotoDuplicado();
      }
      if (busId !== null) {
        await exigirBusAsignable(this.flota, busId);
      }
      return this.guardar(pilotos, expediente, busId);
    });
    this.eventos.publish(new PilotoRegistrado(actorId, id, busId));
    return id;
  }

  private async guardar(
    pilotos: Repository<Piloto>,
    expediente: DatosDePiloto,
    busId: number | null,
  ): Promise<number> {
    try {
      const { correo, ...resto } = expediente;
      const registrado = await pilotos.save({ ...resto, email: correo, busId });
      return registrado.id;
    } catch (error) {
      throw esViolacionDeUnicidad(error) ? new DpiPilotoDuplicado() : error;
    }
  }
}
