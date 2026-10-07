import { Column, Entity, ForeignKey, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({
  name: 'acceso',
  schema: 'transmetro',
  comment: 'Un acceso pertenece exclusivamente a una estación.',
})
@Unique('uq_acceso_estacion_codigo', ['estacionId', 'codigo'])
export class Acceso {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_acceso' })
  id!: number;

  /** Estación del módulo red; se referencia por nombre para no importar su entidad. */
  @Column({ name: 'estacion_id', type: 'integer' })
  @ForeignKey('Estacion', { name: 'fk_acceso_estacion', onDelete: 'CASCADE' })
  estacionId!: number;

  @Column({ name: 'codigo', type: 'varchar', length: 10 })
  codigo!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100, nullable: true })
  nombre!: string | null;
}
