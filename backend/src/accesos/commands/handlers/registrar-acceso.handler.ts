import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import {
  AccesoSinGuardia,
  CodigoAccesoDuplicado,
  EstacionDeAccesoNoExiste,
} from '../../errors/errores-de-accesos';
import { AccesoRegistrado } from '../../events/eventos-de-accesos';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { normalizarCodigo, recortarONulo } from '../../services/normalizacion';
import { RegistrarAcceso } from '../impl/registrar-acceso.command';
import { bloquearGuardiaAsignable, exigirTurnoValido, validarAsignacion } from './validaciones';

@CommandHandler(RegistrarAcceso)
export class RegistrarAccesoHandler implements ICommandHandler<RegistrarAcceso> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly red: RedAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute({ datos, actorId }: RegistrarAcceso): Promise<number> {
    const { estacionId, guardiaId } = datos;
    if (guardiaId === null) {
      throw new AccesoSinGuardia();
    }
    if (!(await this.red.obtenerEstacion(estacionId))) {
      throw new EstacionDeAccesoNoExiste();
    }
    const codigo = normalizarCodigo(datos.codigo);
    const turno = exigirTurnoValido(datos.turno);
    const id = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const accesos = contexto.repositorio(Acceso);
      if (await accesos.existsBy({ estacionId, codigo })) {
        throw new CodigoAccesoDuplicado(codigo);
      }
      await bloquearGuardiaAsignable(contexto, guardiaId);
      await validarAsignacion(contexto, this.red, { accesoId: null, estacionId, guardiaId, turno });
      const registrado = await accesos.save({
        estacionId,
        codigo,
        nombre: recortarONulo(datos.nombre),
      });
      await contexto
        .repositorio(AccesoGuardia)
        .insert({ accesoId: registrado.id, guardiaId, turno });
      return registrado.id;
    });
    this.eventos.publish(new AccesoRegistrado(actorId, id, estacionId, codigo, guardiaId, turno));
    return id;
  }
}
