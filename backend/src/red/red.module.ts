import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Municipalidad } from './entities/municipalidad.entity';
import { Linea } from './entities/linea.entity';
import { Estacion } from './entities/estacion.entity';
import { LineaEstacion } from './entities/linea-estacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Municipalidad, Linea, Estacion, LineaEstacion])],
})
export class RedModule {}
