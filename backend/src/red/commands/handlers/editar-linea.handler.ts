import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Linea } from '../../entities/linea.entity';
import { LineaNoExiste } from '../../errors/errores-de-red';
import { LineaEditada } from '../../events/eventos-de-red';
import { recortar } from '../../services/normalizacion';
import { CambiosDeLinea, EditarLinea } from '../impl/editar-linea.command';
import { cambiosEfectivos, exigirMunicipalidadAsignada } from './validaciones';

@CommandHandler(EditarLinea)
export class EditarLineaHandler implements ICommandHandler<EditarLinea> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: EditarLinea): Promise<void> {
    const cambios = normalizar(comando.cambios);
    const campos = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const lineas = contexto.repositorio(Linea);
      const actual = await lineas.findOneBy({ id: comando.id });
      if (!actual) {
        throw new LineaNoExiste();
      }
      if (cambios.municipalidadId !== undefined) {
        await exigirMunicipalidadAsignada(contexto, cambios.municipalidadId);
      }
      const efectivos = cambiosEfectivos(actual, cambios);
      const cambiados = Object.keys(efectivos);
      if (cambiados.length > 0) {
        await lineas.update({ id: comando.id }, efectivos);
      }
      return cambiados;
    });
    if (campos.length > 0) {
      this.eventos.publish(new LineaEditada(comando.actorId, comando.id, campos));
    }
  }
}

function normalizar(cambios: CambiosDeLinea): CambiosDeLinea {
  return cambios.nombre === undefined ? cambios : { ...cambios, nombre: recortar(cambios.nombre) };
}
