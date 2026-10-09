import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FlotaDeLineaDto } from '../dtos/flota-por-linea.dto';
import { ListarFlotaPorLinea } from '../queries/impl/listar-flota-por-linea.query';

@ApiTags('flota')
@Controller('flota/lineas')
export class FlotaPorLineaController {
  constructor(private readonly consultas: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Por línea: estaciones, mínimo, máximo, buses y estado de la flota.' })
  @ApiOkResponse({ type: [FlotaDeLineaDto] })
  listar(): Promise<FlotaDeLineaDto[]> {
    return this.consultas.execute(new ListarFlotaPorLinea());
  }
}
