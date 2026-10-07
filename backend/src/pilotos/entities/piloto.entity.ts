import { Column, Entity, ForeignKey, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({
  name: 'piloto',
  schema: 'transmetro',
  comment: 'Expediente de piloto: historial educativo, residencia y comunicación.',
})
@Unique('uq_piloto_dpi', ['dpi'])
@Index('idx_piloto_bus', ['busId'])
export class Piloto {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_piloto' })
  id!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'dpi', type: 'varchar', length: 20 })
  dpi!: string;

  @Column({ name: 'direccion_residencia', type: 'varchar', length: 250, nullable: true })
  direccionResidencia!: string | null;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;

  @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
  email!: string | null;

  @Column({ name: 'historial_educativo', type: 'text', nullable: true })
  historialEducativo!: string | null;

  /** Bus del módulo flota; se referencia por nombre para no importar su entidad. */
  @Column({
    name: 'bus_id',
    type: 'integer',
    nullable: true,
    comment: 'Bus (y por extensión línea) en el que presta servicio actualmente.',
  })
  @ForeignKey('Bus', { name: 'fk_piloto_bus', onDelete: 'SET NULL' })
  busId!: number | null;
}
