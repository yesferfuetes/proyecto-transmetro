import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Acceso } from './acceso.entity';
import { GuardiaSeguridad } from './guardia-seguridad.entity';

@Entity({
  name: 'acceso_guardia',
  schema: 'transmetro',
  comment: 'Asignación de guardias a accesos por turno.',
})
export class AccesoGuardia {
  @PrimaryColumn({
    name: 'acceso_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_acceso_guardia',
  })
  accesoId!: number;

  @PrimaryColumn({
    name: 'guardia_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_acceso_guardia',
  })
  guardiaId!: number;

  @PrimaryColumn({
    name: 'turno',
    type: 'varchar',
    length: 20,
    primaryKeyConstraintName: 'pk_acceso_guardia',
  })
  turno!: string;

  @ManyToOne(() => Acceso, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'acceso_id', foreignKeyConstraintName: 'fk_acceso_guardia_acceso' })
  acceso?: Acceso;

  @ManyToOne(() => GuardiaSeguridad, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'guardia_id',
    foreignKeyConstraintName: 'fk_acceso_guardia_guardia_seguridad',
  })
  guardia?: GuardiaSeguridad;
}
