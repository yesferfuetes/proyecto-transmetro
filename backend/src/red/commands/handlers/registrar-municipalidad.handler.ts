import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { MunicipalidadRegistrada } from '../../events/eventos-de-red';
import { recortar } from '../../services/normalizacion';
import { RegistrarMunicipalidad } from '../impl/registrar-municipalidad.command';
import { exigirNombreDeMunicipalidadLibre } from './validaciones';

@CommandHandler(RegistrarMunicipalidad)
export class RegistrarMunicipalidadHandler implements ICommandHandler<RegistrarMunicipalidad> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: RegistrarMunicipalidad): Promise<number> {
    const nombre = recortar(comando.nombre);
    const id = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const municipalidades = contexto.repositorio(Municipalidad);
      await exigirNombreDeMunicipalidadLibre(municipalidades, nombre);
      const registrada = await municipalidades.save({
        nombre,
        departamento: comando.departamento,
        fechaIncorporacion: comando.fechaIncorporacion,
      });
      return registrada.id;
    });
    this.eventos.publish(new MunicipalidadRegistrada(comando.actorId, id, nombre));
    return id;
  }
}
