import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parqueo } from './entities/parqueo.entity';
import { Bus } from './entities/bus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Parqueo, Bus])],
})
export class FlotaModule {}
