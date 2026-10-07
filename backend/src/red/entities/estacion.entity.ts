import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { transformadorDecimal } from '../../shared/transformers/decimal';
import { Municipalidad } from './municipalidad.entity';

@Entity({
  name: 'estacion',
  schema: 'transmetro',
  comment: 'Una estación puede pertenecer a varias líneas y tener varios accesos.',
})
@Unique('uq_estacion_codigo', ['codigo'])
@Index('idx_estacion_municipalidad', ['municipalidadId'])
export class Estacion {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_estacion' })
  id!: number;

  @Column({ name: 'codigo', type: 'varchar', length: 10 })
  codigo!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'municipalidad_id', type: 'integer' })
  municipalidadId!: number;

  @ManyToOne(() => Municipalidad, { nullable: false })
  @JoinColumn({ name: 'municipalidad_id', foreignKeyConstraintName: 'fk_estacion_municipalidad' })
  municipalidad?: Municipalidad;

  @Column({ name: 'tiene_parqueo', type: 'boolean', default: false })
  tieneParqueo!: boolean;

  @Column({
    name: 'latitud',
    type: 'numeric',
    precision: 9,
    scale: 6,
    nullable: true,
    transformer: transformadorDecimal,
  })
  latitud!: number | null;

  @Column({
    name: 'longitud',
    type: 'numeric',
    precision: 9,
    scale: 6,
    nullable: true,
    transformer: transformadorDecimal,
  })
  longitud!: number | null;
}
