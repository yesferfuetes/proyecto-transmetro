import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthCheckAttempt,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { SobreDeError } from '../errors/sobre-de-error';

@ApiTags('salud')
@Controller('health')
export class SaludController {
  constructor(
    private readonly salud: HealthCheckService,
    private readonly baseDeDatos: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOkResponse({ description: 'El servicio y la base de datos responden.' })
  @ApiServiceUnavailableResponse({
    type: SobreDeError,
    description: 'La base de datos no responde.',
  })
  verificar(): Promise<HealthCheckResult> {
    return this.salud.check([
      (): HealthCheckAttempt<'baseDeDatos'> =>
        this.baseDeDatos.pingCheck('baseDeDatos').withTimeout(1500),
    ]);
  }
}
