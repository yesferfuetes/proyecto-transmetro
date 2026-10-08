import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { Linea } from '../../entities/linea.entity';
import {
  EstadoLineaInvalido,
  LineaNoExiste,
  RecorridoInsuficiente,
} from '../../errors/errores-de-red';
import { EstadoDeLineaCambiado } from '../../events/eventos-de-red';
import {
  esEstadoDeLinea,
  MINIMO_DE_ESTACIONES_DE_LINEA_ACTIVA,
} from '../../services/estados-de-linea';
import { CambiarEstadoDeLinea } from '../impl/cambiar-estado-de-linea.command';

@CommandHandler(CambiarEstadoDeLinea)
export class CambiarEstadoDeLineaHandler implements ICommandHandler<CambiarEstadoDeLinea> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: CambiarEstadoDeLinea): Promise<void> {
    const nuevo = comando.estado;
    if (!esEstadoDeLinea(nuevo)) {
      throw new EstadoLineaInvalido();
    }
    const anterior = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const lineas = contexto.repositorio(Linea);
      // Bloquea la línea para que nadie cambie su recorrido mientras se decide el estado.
      const linea = await lineas.findOne({
        where: { id: comando.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!linea) {
        throw new LineaNoExiste();
      }
      if (nuevo === 'ACTIVA') {
        const estaciones = await contexto
          .repositorio(LineaEstacion)
          .countBy({ lineaId: comando.id });
        if (estaciones < MINIMO_DE_ESTACIONES_DE_LINEA_ACTIVA) {
          throw new RecorridoInsuficiente();
        }
      }
      if (linea.estado !== nuevo) {
        await lineas.update({ id: comando.id }, { estado: nuevo });
      }
      return linea.estado;
    });
    if (anterior !== nuevo) {
      this.eventos.publish(new EstadoDeLineaCambiado(comando.actorId, comando.id, anterior, nuevo));
    }
  }
}
