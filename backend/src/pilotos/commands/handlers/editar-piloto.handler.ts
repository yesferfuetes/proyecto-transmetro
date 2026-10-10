import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Not } from 'typeorm';
import type { Repository } from 'typeorm';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Piloto } from '../../entities/piloto.entity';
import { DpiPilotoDuplicado, PilotoNoExiste } from '../../errors/errores-de-pilotos';
import { PilotoEditado } from '../../events/eventos-de-pilotos';
import { esViolacionDeUnicidad } from '../../services/unicidad';
import { DatosDePiloto, validarExpediente } from '../../services/validaciones';
import { EditarPiloto } from '../impl/editar-piloto.command';

/** Campos del expediente y la columna de la fila donde se guarda cada uno. */
const COLUMNAS: Record<keyof DatosDePiloto, keyof Piloto> = {
  nombre: 'nombre',
  dpi: 'dpi',
  direccionResidencia: 'direccionResidencia',
  telefono: 'telefono',
  correo: 'email',
  historialEducativo: 'historialEducativo',
};

@CommandHandler(EditarPiloto)
export class EditarPilotoHandler implements ICommandHandler<EditarPiloto> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, datos, actorId }: EditarPiloto): Promise<void> {
    const nuevos = validarExpediente(datos);
    const campos = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const pilotos = contexto.repositorio(Piloto);
      const actual = await pilotos.findOneBy({ id });
      if (!actual) {
        throw new PilotoNoExiste();
      }
      const cambiados = camposCambiados(actual, nuevos);
      if (cambiados.length > 0) {
        await this.exigirDpiLibre(pilotos, id, nuevos.dpi);
        await this.guardar(pilotos, id, nuevos);
      }
      return cambiados;
    });
    if (campos.length > 0) {
      this.eventos.publish(new PilotoEditado(actorId, id, campos));
    }
  }

  private async exigirDpiLibre(
    pilotos: Repository<Piloto>,
    id: number,
    dpi: string,
  ): Promise<void> {
    if (await pilotos.existsBy({ dpi, id: Not(id) })) {
      throw new DpiPilotoDuplicado();
    }
  }

  private async guardar(
    pilotos: Repository<Piloto>,
    id: number,
    nuevos: DatosDePiloto,
  ): Promise<void> {
    const { correo, ...resto } = nuevos;
    try {
      await pilotos.update({ id }, { ...resto, email: correo });
    } catch (error) {
      throw esViolacionDeUnicidad(error) ? new DpiPilotoDuplicado() : error;
    }
  }
}

function camposCambiados(actual: Piloto, nuevos: DatosDePiloto): string[] {
  return (Object.keys(COLUMNAS) as (keyof DatosDePiloto)[]).filter(
    (campo) => actual[COLUMNAS[campo]] !== nuevos[campo],
  );
}
