import {
  Check,
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
  name: 'linea',
  schema: 'transmetro',
  comment: 'Una línea es una secuencia ordenada de estaciones.',
})
@Unique('uq_linea_codigo', ['codigo'])
@Index('idx_linea_municipalidad', ['municipalidadId'])
@Check('ck_linea_longitud_km', 'longitud_km IS NULL OR longitud_km >= 0')
export class Linea {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_linea' })
  id!: number;

  @Column({ name: 'codigo', type: 'varchar', length: 10 })
  codigo!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'municipalidad_id', type: 'integer' })
  municipalidadId!: number;

  @ManyToOne(() => Municipalidad, { nullable: false })
  @JoinColumn({ name: 'municipalidad_id', foreignKeyConstraintName: 'fk_linea_municipalidad' })
  municipalidad?: Municipalidad;

  @Column({
    name: 'longitud_km',
    type: 'numeric',
    precision: 6,
    scale: 3,
    nullable: true,
    transformer: transformadorDecimal,
    comment: 'Longitud total; se recalcula a partir de linea_estacion.distancia_siguiente_km.',
  })
  longitudKm!: number | null;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 20,
    default: 'ACTIVA',
    comment: 'ACTIVA | INACTIVA | EN_CONSTRUCCION. Validado en la aplicación.',
  })
  estado!: string;

  @Column({ name: 'creado_en', type: 'timestamptz', default: () => 'now()' })
  creadoEn!: Date;
}
