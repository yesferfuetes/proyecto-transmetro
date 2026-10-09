import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  OpcionDeEstacionDto,
  OpcionDeLineaDto,
  OpcionDeParqueoDto,
} from '../dtos/flota-por-linea.dto';
import { ListarOpcionesDeEstaciones } from '../queries/impl/listar-opciones-de-estaciones.query';
import { ListarOpcionesDeLineas } from '../queries/impl/listar-opciones-de-lineas.query';
import { ListarOpcionesDeParqueos } from '../queries/impl/listar-opciones-de-parqueos.query';

@ApiTags('flota')
@Controller('flota/opciones')
export class OpcionesController {
  constructor(private readonly consultas: QueryBus) {}

  @Get('lineas')
  @ApiOperation({ summary: 'Líneas no inactivas con su número de estaciones, buses y máximo.' })
  @ApiOkResponse({ type: [OpcionDeLineaDto] })
  lineas(): Promise<OpcionDeLineaDto[]> {
    return this.consultas.execute(new ListarOpcionesDeLineas());
  }

  @Get('parqueos')
  @ApiOperation({ summary: 'Parqueos con cupo para un bus más.' })
  @ApiOkResponse({ type: [OpcionDeParqueoDto] })
  parqueos(): Promise<OpcionDeParqueoDto[]> {
    return this.consultas.execute(new ListarOpcionesDeParqueos());
  }

  @Get('estaciones')
  @ApiOperation({ summary: 'Estaciones, con la marca de si tienen parqueo.' })
  @ApiOkResponse({ type: [OpcionDeEstacionDto] })
  estaciones(): Promise<OpcionDeEstacionDto[]> {
    return this.consultas.execute(new ListarOpcionesDeEstaciones());
  }
}
