import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { MunicipalidadNoExiste } from '../../errors/errores-de-red';
import { MunicipalidadEditada } from '../../events/eventos-de-red';
import { recortar } from '../../services/normalizacion';
import { CambiosDeMunicipalidad, EditarMunicipalidad } from '../impl/editar-municipalidad.command';
import { cambiosEfectivos, exigirNombreDeMunicipalidadLibre } from './validaciones';

@CommandHandler(EditarMunicipalidad)
export class EditarMunicipalidadHandler implements ICommandHandler<EditarMunicipalidad> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: EditarMunicipalidad): Promise<void> {
    const cambios = normalizar(comando.cambios);
    const campos = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const municipalidades = contexto.repositorio(Municipalidad);
      const actual = await municipalidades.findOneBy({ id: comando.id });
      if (!actual) {
        throw new MunicipalidadNoExiste();
      }
      if (cambios.nombre !== undefined) {
        await exigirNombreDeMunicipalidadLibre(municipalidades, cambios.nombre, comando.id);
      }
      const efectivos = cambiosEfectivos(actual, cambios);
      const cambiados = Object.keys(efectivos);
      if (cambiados.length > 0) {
        await municipalidades.update({ id: comando.id }, efectivos);
      }
      return cambiados;
    });
    if (campos.length > 0) {
      this.eventos.publish(new MunicipalidadEditada(comando.actorId, comando.id, campos));
    }
  }
}

function normalizar(cambios: CambiosDeMunicipalidad): CambiosDeMunicipalidad {
  return cambios.nombre === undefined ? cambios : { ...cambios, nombre: recortar(cambios.nombre) };
}
