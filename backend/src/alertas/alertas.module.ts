import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertaCapacidad } from './entities/alerta-capacidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertaCapacidad])],
})
export class AlertasModule {}
