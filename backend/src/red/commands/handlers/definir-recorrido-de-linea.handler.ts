import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { In, Not } from 'typeorm';
import { NumeroDeEstacionesDeLineaCambiado } from '../../../shared/contratos/red';
import { ContextoTransaccional, UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Estacion } from '../../entities/estacion.entity';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { Linea } from '../../entities/linea.entity';
import {
  DistanciaInvalida,
  DistanciaRequerida,
  EstacionDelRecorridoNoExiste,
  EstacionRepetidaEnRecorrido,
  EstacionSinLinea,
  LineaNoExiste,
  RecorridoInsuficiente,
} from '../../errors/errores-de-red';
import { RecorridoDeLineaDefinido } from '../../events/eventos-de-red';
import { kmAMetros, METROS_POR_KM, metrosAKm } from '../../services/distancias';
import { MINIMO_DE_ESTACIONES_DE_LINEA_ACTIVA } from '../../services/estados-de-linea';
import { DefinirRecorridoDeLinea, Parada } from '../impl/definir-recorrido-de-linea.command';

const DISTANCIA_MAXIMA_EN_METROS = 999_999;
const TOLERANCIA_DE_REDONDEO = 1e-6;

interface Resultado {
  anterior: number;
  nuevo: number;
  longitudKm: number | null;
}

/**
 * Reemplaza el recorrido completo de una línea. Todo el recorrido se valida antes de escribir:
 * cualquier error deja el recorrido vigente intacto.
 */
@CommandHandler(DefinirRecorridoDeLinea)
export class DefinirRecorridoDeLineaHandler implements ICommandHandler<DefinirRecorridoDeLinea> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: DefinirRecorridoDeLinea): Promise<void> {
    const resultado = await this.unidadDeTrabajo.ejecutar((contexto) =>
      this.definir(contexto, comando),
    );
    this.eventos.publish(
      new RecorridoDeLineaDefinido(
        comando.actorId,
        comando.lineaId,
        resultado.nuevo,
        resultado.longitudKm,
      ),
    );
    if (resultado.anterior !== resultado.nuevo) {
      this.eventos.publish(
        new NumeroDeEstacionesDeLineaCambiado(comando.lineaId, resultado.anterior, resultado.nuevo),
      );
    }
  }

  private async definir(
    contexto: ContextoTransaccional,
    { lineaId, paradas }: DefinirRecorridoDeLinea,
  ): Promise<Resultado> {
    const linea = await this.bloquearLinea(contexto, lineaId);
    const ids = paradas.map((parada) => parada.estacionId);
    this.rechazarRepetidas(ids);
    await this.exigirEstaciones(contexto, ids);
    const metros = this.distanciasEnMetros(paradas);
    this.exigirMinimoSiEstaActiva(linea, paradas.length);
    const vigente = await contexto.repositorio(LineaEstacion).find({
      where: { lineaId },
      relations: { estacion: true },
    });
    await this.rechazarEstacionesQueQuedanSinLinea(contexto, lineaId, vigente, ids);
    const longitudKm = await this.reemplazar(contexto, lineaId, ids, metros);
    return { anterior: vigente.length, nuevo: paradas.length, longitudKm };
  }

  /** Bloquea la fila de la línea hasta el final de la transacción. */
  private async bloquearLinea(contexto: ContextoTransaccional, lineaId: number): Promise<Linea> {
    const linea = await contexto.repositorio(Linea).findOne({
      where: { id: lineaId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!linea) {
      throw new LineaNoExiste();
    }
    return linea;
  }

  private rechazarRepetidas(ids: readonly number[]): void {
    const vistas = new Set<number>();
    for (const id of ids) {
      if (vistas.has(id)) {
        throw new EstacionRepetidaEnRecorrido(id);
      }
      vistas.add(id);
    }
  }

  private async exigirEstaciones(
    contexto: ContextoTransaccional,
    ids: readonly number[],
  ): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const existentes = await contexto.repositorio(Estacion).find({
      select: { id: true },
      where: { id: In([...ids]) },
    });
    const encontradas = new Set(existentes.map((estacion) => estacion.id));
    const faltantes = ids.filter((id) => !encontradas.has(id));
    if (faltantes.length > 0) {
      throw new EstacionDelRecorridoNoExiste(faltantes);
    }
  }

  /**
   * Distancia de cada parada a la siguiente, en metros enteros. La última no tiene: si llega una,
   * se descarta.
   */
  private distanciasEnMetros(paradas: readonly Parada[]): (number | null)[] {
    return paradas.map((parada, indice) =>
      indice === paradas.length - 1
        ? null
        : this.distanciaEnMetros(parada.distanciaSiguienteKm, indice + 1),
    );
  }

  private distanciaEnMetros(km: number | null, posicion: number): number {
    if (km === null) {
      throw new DistanciaRequerida(posicion);
    }
    const metros = kmAMetros(km);
    const conMasDeTresDecimales = Math.abs(km * METROS_POR_KM - metros) > TOLERANCIA_DE_REDONDEO;
    const fueraDeRango =
      !Number.isSafeInteger(metros) || metros <= 0 || metros > DISTANCIA_MAXIMA_EN_METROS;
    if (fueraDeRango || conMasDeTresDecimales) {
      throw new DistanciaInvalida(posicion);
    }
    return metros;
  }

  private exigirMinimoSiEstaActiva(linea: Linea, paradas: number): void {
    if (linea.estado === 'ACTIVA' && paradas < MINIMO_DE_ESTACIONES_DE_LINEA_ACTIVA) {
      throw new RecorridoInsuficiente();
    }
  }

  /** Una estación que sale de esta línea debe seguir en al menos otra. */
  private async rechazarEstacionesQueQuedanSinLinea(
    contexto: ContextoTransaccional,
    lineaId: number,
    vigente: readonly LineaEstacion[],
    nuevas: readonly number[],
  ): Promise<void> {
    const quedan = new Set(nuevas);
    const quitadas = vigente.filter((fila) => !quedan.has(fila.estacionId));
    if (quitadas.length === 0) {
      return;
    }
    const enOtrasLineas = await contexto.repositorio(LineaEstacion).find({
      select: { estacionId: true },
      where: { estacionId: In(quitadas.map((fila) => fila.estacionId)), lineaId: Not(lineaId) },
    });
    const conOtraLinea = new Set(enOtrasLineas.map((fila) => fila.estacionId));
    const sinLinea = quitadas
      .filter((fila) => !conOtraLinea.has(fila.estacionId))
      .map((fila) => fila.estacion?.codigo ?? String(fila.estacionId));
    if (sinLinea.length > 0) {
      throw new EstacionSinLinea(sinLinea);
    }
  }

  /** Sustituye las filas del recorrido y recalcula la longitud de la línea. */
  private async reemplazar(
    contexto: ContextoTransaccional,
    lineaId: number,
    ids: readonly number[],
    metros: readonly (number | null)[],
  ): Promise<number | null> {
    const recorrido = contexto.repositorio(LineaEstacion);
    await recorrido.delete({ lineaId });
    if (ids.length > 0) {
      await recorrido.insert(
        ids.map((estacionId, indice) => ({
          lineaId,
          estacionId,
          ordenSecuencia: indice + 1,
          distanciaSiguienteKm: metrosANulable(metros[indice] ?? null),
        })),
      );
    }
    const longitudKm =
      ids.length === 0 ? null : metrosAKm(metros.reduce<number>((suma, m) => suma + (m ?? 0), 0));
    await contexto.repositorio(Linea).update({ id: lineaId }, { longitudKm });
    return longitudKm;
  }
}

function metrosANulable(metros: number | null): number | null {
  return metros === null ? null : metrosAKm(metros);
}
