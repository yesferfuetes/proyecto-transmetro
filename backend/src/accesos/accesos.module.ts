import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Acceso } from './entities/acceso.entity';
import { GuardiaSeguridad } from './entities/guardia-seguridad.entity';
import { AccesoGuardia } from './entities/acceso-guardia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Acceso, GuardiaSeguridad, AccesoGuardia])],
})
export class AccesosModule {}
