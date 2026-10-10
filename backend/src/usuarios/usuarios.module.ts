import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Entorno } from '../shared/config/entorno';
import { ConsultasDeUsuarios } from '../shared/contratos/usuarios';
import { AsignarContrasenaHandler } from './commands/handlers/asignar-contrasena.handler';
import { CambiarMiContrasenaHandler } from './commands/handlers/cambiar-mi-contrasena.handler';
import { DesactivarUsuarioHandler } from './commands/handlers/desactivar-usuario.handler';
import { EditarUsuarioHandler } from './commands/handlers/editar-usuario.handler';
import { IniciarSesionHandler } from './commands/handlers/iniciar-sesion.handler';
import { ReactivarUsuarioHandler } from './commands/handlers/reactivar-usuario.handler';
import { RegistrarAuditoriaHandler } from './commands/handlers/registrar-auditoria.handler';
import { RegistrarUsuarioHandler } from './commands/handlers/registrar-usuario.handler';
import { MiCuentaController } from './controllers/mi-cuenta.controller';
import { SesionesController } from './controllers/sesiones.controller';
import { UsuariosController } from './controllers/usuarios.controller';
import { Auditoria } from './entities/auditoria.entity';
import { Usuario } from './entities/usuario.entity';
import { RegistradorDeAuditoria } from './events/event-listeners/registrador-de-auditoria';
import { ConsultasDeUsuariosAdapter } from './infrastructure/adapters/consultas-de-usuarios.adapter';
import { RedAdapter } from './infrastructure/adapters/red.adapter';
import { ListarEstacionesAsignablesHandler } from './queries/handlers/listar-estaciones-asignables.handler';
import { ListarUsuariosHandler } from './queries/handlers/listar-usuarios.handler';
import { ObtenerMiCuentaHandler } from './queries/handlers/obtener-mi-cuenta.handler';
import { ObtenerUsuarioDeSesionHandler } from './queries/handlers/obtener-usuario-de-sesion.handler';
import { ObtenerUsuarioHandler } from './queries/handlers/obtener-usuario.handler';
import { ObtenerUsuariosResumenHandler } from './queries/handlers/obtener-usuarios-resumen.handler';
import { DURACION_SESION_SEGUNDOS, EmisorDeTokens } from './services/emisor-de-tokens.service';
import { VerificadorDeSesionGuard } from './strategies/verificador-de-sesion.guard';

const MANEJADORES_DE_COMANDOS = [
  IniciarSesionHandler,
  RegistrarUsuarioHandler,
  EditarUsuarioHandler,
  DesactivarUsuarioHandler,
  ReactivarUsuarioHandler,
  AsignarContrasenaHandler,
  CambiarMiContrasenaHandler,
  RegistrarAuditoriaHandler,
];

const MANEJADORES_DE_CONSULTAS = [
  ObtenerUsuarioDeSesionHandler,
  ObtenerMiCuentaHandler,
  ListarUsuariosHandler,
  ObtenerUsuarioHandler,
  ListarEstacionesAsignablesHandler,
  ObtenerUsuariosResumenHandler,
];

/** Usuarios y sesión. Es global para que los demás módulos consulten usuarios por su contrato. */
@Global()
@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Usuario, Auditoria]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configuracion: ConfigService<Entorno, true>) => ({
        secret: configuracion.get('JWT_SECRETO', { infer: true }),
        signOptions: { algorithm: 'HS256', expiresIn: DURACION_SESION_SEGUNDOS },
        verifyOptions: { algorithms: ['HS256'] },
      }),
    }),
  ],
  // El orden importa: `/usuarios/yo` se registra antes que `/usuarios/:id`.
  controllers: [SesionesController, MiCuentaController, UsuariosController],
  providers: [
    ...MANEJADORES_DE_COMANDOS,
    ...MANEJADORES_DE_CONSULTAS,
    EmisorDeTokens,
    RedAdapter,
    RegistradorDeAuditoria,
    { provide: ConsultasDeUsuarios, useClass: ConsultasDeUsuariosAdapter },
    { provide: APP_GUARD, useClass: VerificadorDeSesionGuard },
  ],
  exports: [ConsultasDeUsuarios],
})
export class UsuariosModule {}
