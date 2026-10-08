import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Estacion } from '../../entities/estacion.entity';
import { CodigoEstacionDuplicado } from '../../errors/errores-de-red';
import { EstacionRegistrada } from '../../events/eventos-de-red';
import { normalizarCodigo, recortar } from '../../services/normalizacion';
import { RegistrarEstacion } from '../impl/registrar-estacion.command';
import { exigirMunicipalidadAsignada, validarCoordenadas } from './validaciones';

@CommandHandler(RegistrarEstacion)
export class RegistrarEstacionHandler implements ICommandHandler<RegistrarEstacion> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: RegistrarEstacion): Promise<number> {
    const { datos } = comando;
    const codigo = normalizarCodigo(datos.codigo);
    validarCoordenadas(datos.latitud, datos.longitud);
    const id = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      await exigirMunicipalidadAsignada(contexto, datos.municipalidadId);
      const estaciones = contexto.repositorio(Estacion);
      if (await estaciones.existsBy({ codigo })) {
        throw new CodigoEstacionDuplicado(codigo);
      }
      const registrada = await estaciones.save({
        codigo,
        nombre: recortar(datos.nombre),
        municipalidadId: datos.municipalidadId,
        tieneParqueo: datos.tieneParqueo,
        latitud: datos.latitud,
        longitud: datos.longitud,
      });
      return registrada.id;
    });
    this.eventos.publish(new EstacionRegistrada(comando.actorId, id, codigo));
    return id;
  }
}
