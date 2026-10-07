import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({
  name: 'guardia_seguridad',
  schema: 'transmetro',
  comment: 'Personal de seguridad asignable a uno o varios accesos, por turno.',
})
@Unique('uq_guardia_seguridad_dpi', ['dpi'])
export class GuardiaSeguridad {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_guardia_seguridad' })
  id!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'dpi', type: 'varchar', length: 20 })
  dpi!: string;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  telefono!: string | null;
}
