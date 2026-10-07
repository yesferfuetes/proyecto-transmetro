import {
  Check,
  Column,
  Entity,
  ForeignKey,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Parqueo } from './parqueo.entity';

@Entity({
  name: 'bus',
  schema: 'transmetro',
  comment: 'Flota de buses de la red. El rango de buses por línea se valida en la aplicación.',
})
@Unique('uq_bus_placa', ['placa'])
@Index('idx_bus_linea', ['lineaId'])
@Index('idx_bus_parqueo', ['parqueoId'])
@Check('ck_bus_capacidad_max', 'capacidad_max > 0')
export class Bus {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_bus' })
  id!: number;

  @Column({ name: 'placa', type: 'varchar', length: 15 })
  placa!: string;

  @Column({ name: 'capacidad_max', type: 'integer' })
  capacidadMax!: number;

  /** Línea del módulo red; se referencia por nombre para no importar su entidad. */
  @Column({
    name: 'linea_id',
    type: 'integer',
    nullable: true,
    comment: 'NULL = bus sin línea asignada; un bus nunca está en más de una línea a la vez.',
  })
  @ForeignKey('Linea', { name: 'fk_bus_linea', onDelete: 'SET NULL' })
  lineaId!: number | null;

  @Column({
    name: 'parqueo_id',
    type: 'integer',
    comment: 'NOT NULL: un bus nunca queda sin parqueo asignado, aunque pueda cambiar de parqueo.',
  })
  parqueoId!: number;

  @ManyToOne(() => Parqueo, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parqueo_id', foreignKeyConstraintName: 'fk_bus_parqueo' })
  parqueo?: Parqueo;

  @Column({
    name: 'estado',
    type: 'varchar',
    length: 20,
    default: 'ACTIVO',
    comment: 'ACTIVO | MANTENIMIENTO | BAJA. Validado en la aplicación.',
  })
  estado!: string;
}
