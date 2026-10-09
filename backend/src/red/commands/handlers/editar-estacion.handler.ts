import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Estacion } from '../../entities/estacion.entity';
import { EstacionConParqueos, EstacionNoExiste } from '../../errors/errores-de-red';
import { EstacionEditada } from '../../events/eventos-de-red';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { recortar } from '../../services/normalizacion';
import { CambiosDeEstacion, EditarEstacion } from '../impl/editar-estacion.command';
import { cambiosEfectivos, exigirMunicipalidadAsignada, validarCoordenadas } from './validaciones';

@CommandHandler(EditarEstacion)
export class EditarEstacionHandler implements ICommandHandler<EditarEstacion> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
    private readonly flota: FlotaAdapter,
  ) {}

  async execute(comando: EditarEstacion): Promise<void> {
    const cambios = normalizar(comando.cambios);
    const campos = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const estaciones = contexto.repositorio(Estacion);
      const actual = await estaciones.findOneBy({ id: comando.id });
      if (!actual) {
        throw new EstacionNoExiste();
      }
      validarCoordenadas(
        cambios.latitud === undefined ? actual.latitud : cambios.latitud,
        cambios.longitud === undefined ? actual.longitud : cambios.longitud,
      );
      await this.exigirSinParqueos(comando.id, actual, cambios);
      if (cambios.municipalidadId !== undefined) {
        await exigirMunicipalidadAsignada(contexto, cambios.municipalidadId);
      }
      const efectivos = cambiosEfectivos(actual, cambios);
      const cambiados = Object.keys(efectivos);
      if (cambiados.length > 0) {
        await estaciones.update({ id: comando.id }, efectivos);
      }
      return cambiados;
    });
    if (campos.length > 0) {
      this.eventos.publish(new EstacionEditada(comando.actorId, comando.id, campos));
    }
  }

  private async exigirSinParqueos(
    id: number,
    actual: Estacion,
    cambios: CambiosDeEstacion,
  ): Promise<void> {
    if (
      cambios.tieneParqueo === false &&
      actual.tieneParqueo &&
      (await this.flota.estacionTieneParqueos(id))
    ) {
      throw new EstacionConParqueos();
    }
  }
}

function normalizar(cambios: CambiosDeEstacion): CambiosDeEstacion {
  return cambios.nombre === undefined ? cambios : { ...cambios, nombre: recortar(cambios.nombre) };
}
