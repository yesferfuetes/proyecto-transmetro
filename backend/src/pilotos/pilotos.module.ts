import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Piloto } from './entities/piloto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Piloto])],
})
export class PilotosModule {}
