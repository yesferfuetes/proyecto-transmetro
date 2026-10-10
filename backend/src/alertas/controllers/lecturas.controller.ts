import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioActual } from '../../shared/auth/decoradores';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { RegistrarDemandaDeEstacion } from '../commands/impl/registrar-demanda-de-estacion.command';
import { RegistrarOcupacionDeBus } from '../commands/impl/registrar-ocupacion-de-bus.command';
import { AlertaCreadaDto, BusParaLecturaDto, LecturaDto } from '../dtos/lectura.dto';
import { EstacionAjena } from '../errors/errores-de-alertas';
import { ListarBusesParaLectura } from '../queries/impl/listar-buses-para-lectura.query';
import { exigirSesion } from './actor';
import { ErroresDeEscritura } from './respuestas-de-error';

@ApiTags('alertas')
@Controller('alertas')
export class LecturasController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Post('demandas')
  @Roles('OPERADOR_ESTACION')
  @ApiOperation({
    summary: 'Registra los pasajeros esperando en la estación; con 150 % o más crea una alerta.',
  })
  @ApiCreatedResponse({ type: AlertaCreadaDto })
  @ErroresDeEscritura()
  async registrarDemanda(
    @Body() cuerpo: LecturaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<AlertaCreadaDto> {
    const sesion = exigirSesion(usuario);
    const alertaId = await this.comandos.execute(
      new RegistrarDemandaDeEstacion(
        cuerpo.estacionId,
        cuerpo.busId,
        cuerpo.pasajeros ?? null,
        sesion.estacionId,
        sesion.id,
      ),
    );
    return { alertaId };
  }

  @Post('ocupaciones')
  @Roles('OPERADOR_ESTACION')
  @ApiOperation({
    summary: 'Registra los pasajeros a bordo de un bus; con menos de 25 % crea una alerta.',
  })
  @ApiCreatedResponse({ type: AlertaCreadaDto })
  @ErroresDeEscritura()
  async registrarOcupacion(
    @Body() cuerpo: LecturaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<AlertaCreadaDto> {
    const sesion = exigirSesion(usuario);
    const alertaId = await this.comandos.execute(
      new RegistrarOcupacionDeBus(
        cuerpo.estacionId,
        cuerpo.busId,
        cuerpo.pasajeros ?? null,
        sesion.estacionId,
        sesion.id,
      ),
    );
    return { alertaId };
  }

  @Get('opciones/buses')
  @Roles('OPERADOR_ESTACION')
  @ApiOperation({ summary: 'Buses activos de las líneas que pasan por la estación de la sesión.' })
  @ApiOkResponse({ type: [BusParaLecturaDto] })
  listarBuses(@UsuarioActual() usuario: UsuarioSesion | undefined): Promise<BusParaLecturaDto[]> {
    const { estacionId } = exigirSesion(usuario);
    if (estacionId === null) {
      throw new EstacionAjena();
    }
    return this.consultas.execute(new ListarBusesParaLectura(estacionId));
  }
}
