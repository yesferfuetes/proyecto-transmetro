import { Check, Column, Entity, ForeignKey, Index, PrimaryGeneratedColumn } from 'typeorm';
import { transformadorDecimal } from '../../shared/transformers/decimal';

@Entity({
  name: 'alerta_capacidad',
  schema: 'transmetro',
  comment: 'Alertas de capacidad generadas por la aplicación.',
})
@Index('idx_alerta_estacion_fecha', ['estacionId', 'fechaHora'])
@Index('idx_alerta_bus_fecha', ['busId', 'fechaHora'])
@Check('ck_alerta_capacidad_porcentaje_ocupacion', 'porcentaje_ocupacion >= 0')
export class AlertaCapacidad {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_alerta_capacidad' })
  id!: number;

  /** Estación del módulo red; se referencia por nombre para no importar su entidad. */
  @Column({ name: 'estacion_id', type: 'integer' })
  @ForeignKey('Estacion', { name: 'fk_alerta_capacidad_estacion', onDelete: 'NO ACTION' })
  estacionId!: number;

  /** Bus del módulo flota; se referencia por nombre para no importar su entidad. */
  @Column({ name: 'bus_id', type: 'integer' })
  @ForeignKey('Bus', { name: 'fk_alerta_capacidad_bus', onDelete: 'NO ACTION' })
  busId!: number;

  @Column({
    name: 'tipo',
    type: 'varchar',
    length: 20,
    comment:
      'SOBRECUPO: ocupación >= 150% de la capacidad del bus. BAJA_OCUPACION: < 25%, aplica espera adicional de 5 minutos por estación.',
  })
  tipo!: string;

  @Column({
    name: 'porcentaje_ocupacion',
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: transformadorDecimal,
  })
  porcentajeOcupacion!: number;

  @Column({ name: 'fecha_hora', type: 'timestamptz', default: () => 'now()' })
  fechaHora!: Date;

  @Column({ name: 'atendida', type: 'boolean', default: false })
  atendida!: boolean;

  /** Usuario del módulo usuarios; se referencia por nombre para no importar su entidad. */
  @Column({ name: 'atendida_por', type: 'integer', nullable: true })
  @ForeignKey('Usuario', { name: 'fk_alerta_capacidad_usuario', onDelete: 'NO ACTION' })
  atendidaPor!: number | null;
}
