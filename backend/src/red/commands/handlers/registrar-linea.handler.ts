import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Linea } from '../../entities/linea.entity';
import {
  CodigoLineaDuplicado,
  EstadoLineaInvalido,
  RecorridoInsuficiente,
} from '../../errors/errores-de-red';
import { LineaRegistrada } from '../../events/eventos-de-red';
import { esEstadoDeLinea } from '../../services/estados-de-linea';
import { normalizarCodigo, recortar } from '../../services/normalizacion';
import { RegistrarLinea } from '../impl/registrar-linea.command';
import { exigirMunicipalidadAsignada } from './validaciones';

@CommandHandler(RegistrarLinea)
export class RegistrarLineaHandler implements ICommandHandler<RegistrarLinea> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: RegistrarLinea): Promise<number> {
    const { datos } = comando;
    const codigo = normalizarCodigo(datos.codigo);
    if (!esEstadoDeLinea(datos.estado)) {
      throw new EstadoLineaInvalido();
    }
    // Una línea nueva no tiene recorrido: no puede nacer activa.
    if (datos.estado === 'ACTIVA') {
      throw new RecorridoInsuficiente();
    }
    const estado = datos.estado;
    const id = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      await exigirMunicipalidadAsignada(contexto, datos.municipalidadId);
      const lineas = contexto.repositorio(Linea);
      if (await lineas.existsBy({ codigo })) {
        throw new CodigoLineaDuplicado(codigo);
      }
      const registrada = await lineas.save({
        codigo,
        nombre: recortar(datos.nombre),
        municipalidadId: datos.municipalidadId,
        estado,
        longitudKm: null,
      });
      return registrada.id;
    });
    this.eventos.publish(new LineaRegistrada(comando.actorId, id, codigo, estado));
    return id;
  }
}
