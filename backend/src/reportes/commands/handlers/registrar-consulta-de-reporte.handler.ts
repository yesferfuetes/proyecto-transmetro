import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import {
  ConstanciaNoRegistrada,
  EstacionNoExiste,
  LineaNoExiste,
  MunicipalidadNoExiste,
  TipoDeReporteInvalido,
} from '../../errors/errores-de-reportes';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { normalizarFiltros } from '../../services/filtros';
import { esTipoDeReporte, FiltrosDeReporte, TipoDeReporte } from '../../services/tipos-de-reporte';
import { RegistrarConsultaDeReporte } from '../impl/registrar-consulta-de-reporte.command';

@CommandHandler(RegistrarConsultaDeReporte)
export class RegistrarConsultaDeReporteHandler implements ICommandHandler<RegistrarConsultaDeReporte> {
  private readonly registro = new Logger(RegistrarConsultaDeReporteHandler.name);

  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly red: RedAdapter,
  ) {}

  async execute({ tipo, filtros, actorId }: RegistrarConsultaDeReporte): Promise<number> {
    const tipoValido = this.validarTipo(tipo);
    await this.validarFiltros(filtros);
    return this.guardar(tipoValido, filtros, actorId);
  }

  private validarTipo(tipo: string): TipoDeReporte {
    if (!esTipoDeReporte(tipo)) {
      throw new TipoDeReporteInvalido();
    }
    return tipo;
  }

  private async validarFiltros(filtros: FiltrosDeReporte): Promise<void> {
    if (normalizarFiltros(filtros) === null) {
      return;
    }
    const red = await this.red.obtenerRed();
    if (filtros.lineaId !== undefined && !red.lineas.some((l) => l.id === filtros.lineaId)) {
      throw new LineaNoExiste();
    }
    if (
      filtros.estacionId !== undefined &&
      !red.estaciones.some((e) => e.id === filtros.estacionId)
    ) {
      throw new EstacionNoExiste();
    }
    if (
      filtros.municipalidadId !== undefined &&
      !red.municipalidades.some((m) => m.id === filtros.municipalidadId)
    ) {
      throw new MunicipalidadNoExiste();
    }
  }

  /** La transacción cubre solo el insert; cualquier falla se traduce a un error de dominio. */
  private async guardar(
    tipo: TipoDeReporte,
    filtros: FiltrosDeReporte,
    actorId: number,
  ): Promise<number> {
    try {
      return await this.unidadDeTrabajo.ejecutar(async (contexto) => {
        const constancia = await contexto.repositorio(ReporteConsulta).save({
          usuarioId: actorId,
          tipoReporte: tipo,
          filtrosJson: normalizarFiltros(filtros),
        });
        return constancia.id;
      });
    } catch (causa) {
      this.registro.error(causa instanceof Error ? (causa.stack ?? causa.message) : causa);
      throw new ConstanciaNoRegistrada();
    }
  }
}
