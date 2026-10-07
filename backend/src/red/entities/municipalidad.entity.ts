import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({
  name: 'municipalidad',
  schema: 'transmetro',
  comment: 'Municipalidad propietaria de líneas y estaciones.',
})
@Unique('uq_municipalidad_nombre', ['nombre'])
export class Municipalidad {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_municipalidad' })
  id!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'departamento', type: 'varchar', length: 100, nullable: true })
  departamento!: string | null;

  @Column({ name: 'fecha_incorporacion', type: 'date', nullable: true })
  fechaIncorporacion!: string | null;
}
