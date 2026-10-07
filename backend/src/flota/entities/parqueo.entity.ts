import { Check, Column, Entity, ForeignKey, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({
  name: 'parqueo',
  schema: 'transmetro',
  comment: 'Parqueos disponibles en las estaciones que cuentan con esta infraestructura.',
})
@Unique('uq_parqueo_estacion_codigo', ['estacionId', 'codigo'])
@Check('ck_parqueo_capacidad_vehiculos', 'capacidad_vehiculos > 0')
export class Parqueo {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_parqueo' })
  id!: number;

  /** Estación del módulo red; se referencia por nombre para no importar su entidad. */
  @Column({ name: 'estacion_id', type: 'integer' })
  @ForeignKey('Estacion', { name: 'fk_parqueo_estacion', onDelete: 'CASCADE' })
  estacionId!: number;

  @Column({ name: 'codigo', type: 'varchar', length: 10 })
  codigo!: string;

  @Column({ name: 'capacidad_vehiculos', type: 'integer' })
  capacidadVehiculos!: number;
}
