import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Parqueo } from '../../entities/parqueo.entity';
import {
  CodigoParqueoDuplicado,
  EstacionNoExiste,
  EstacionSinParqueo,
} from '../../errors/errores-de-flota';
import { ParqueoRegistrado } from '../../events/eventos-de-flota';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { normalizarCodigo } from '../../services/normalizacion';
import { RegistrarParqueo } from '../impl/registrar-parqueo.command';
import { validarCapacidadDeParqueo } from './validaciones';

@CommandHandler(RegistrarParqueo)
export class RegistrarParqueoHandler implements ICommandHandler<RegistrarParqueo> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly red: RedAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute({ datos, actorId }: RegistrarParqueo): Promise<number> {
    validarCapacidadDeParqueo(datos.capacidadVehiculos);
    const codigo = normalizarCodigo(datos.codigo);
    const { estacionId, capacidadVehiculos } = datos;
    const estacion = await this.red.obtenerEstacion(estacionId);
    if (!estacion) {
      throw new EstacionNoExiste();
    }
    if (!estacion.tieneParqueo) {
      throw new EstacionSinParqueo();
    }
    const id = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const parqueos = contexto.repositorio(Parqueo);
      if (await parqueos.existsBy({ estacionId, codigo })) {
        throw new CodigoParqueoDuplicado(codigo);
      }
      const registrado = await parqueos.save({ estacionId, codigo, capacidadVehiculos });
      return registrado.id;
    });
    this.eventos.publish(new ParqueoRegistrado(actorId, id, estacionId, codigo));
    return id;
  }
}
