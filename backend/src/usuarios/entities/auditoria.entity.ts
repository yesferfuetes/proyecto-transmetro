import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity({
  name: 'auditoria',
  schema: 'transmetro',
  comment: 'Constancia de los cambios hechos en el sistema y de los inicios de sesión fallidos.',
})
@Index('idx_auditoria_fecha_hora', ['fechaHora'])
@Index('idx_auditoria_entidad', ['entidad', 'entidadId'])
export class Auditoria {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_auditoria' })
  id!: number;

  @Column({ name: 'fecha_hora', type: 'timestamptz', default: () => 'now()' })
  fechaHora!: Date;

  @Column({
    name: 'usuario_id',
    type: 'integer',
    nullable: true,
    comment: 'Quién hizo el cambio; nulo en un inicio de sesión fallido.',
  })
  usuarioId!: number | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'usuario_id', foreignKeyConstraintName: 'fk_auditoria_usuario' })
  usuario?: Usuario | null;

  @Column({
    name: 'correo_intentado',
    type: 'varchar',
    length: 150,
    nullable: true,
    comment: 'Correo escrito en un inicio de sesión fallido.',
  })
  correoIntentado!: string | null;

  @Column({
    name: 'accion',
    type: 'varchar',
    length: 60,
    comment: 'Qué ocurrió, por ejemplo USUARIO_DESACTIVADO.',
  })
  accion!: string;

  @Column({ name: 'entidad', type: 'varchar', length: 40, comment: 'Tabla del registro afectado.' })
  entidad!: string;

  @Column({ name: 'entidad_id', type: 'varchar', length: 40, nullable: true })
  entidadId!: string | null;

  @Column({
    name: 'resumen',
    type: 'text',
    nullable: true,
    comment: 'Resumen del cambio en JSON. Nunca contiene contraseñas.',
  })
  resumen!: string | null;
}
