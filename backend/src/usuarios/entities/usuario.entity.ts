import { Column, Entity, ForeignKey, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({
  name: 'usuario',
  schema: 'transmetro',
  comment: 'Usuarios del sistema con niveles de acceso diferenciados por rol.',
})
@Unique('uq_usuario_email', ['email'])
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_usuario' })
  id!: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre!: string;

  @Column({ name: 'email', type: 'varchar', length: 150 })
  email!: string;

  /** Nunca se selecciona por defecto: se pide de forma explícita solo para autenticar. */
  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash!: string;

  @Column({
    name: 'rol',
    type: 'varchar',
    length: 30,
    comment: 'OPERADOR_ESTACION | SUPERVISOR_MUNICIPAL | ADMINISTRADOR. Validado en la aplicación.',
  })
  rol!: string;

  /** Estación del módulo red; se referencia por nombre para no importar su entidad. */
  @Column({
    name: 'estacion_id',
    type: 'integer',
    nullable: true,
    comment:
      'Estación de trabajo asignada; obligatoria para el rol OPERADOR_ESTACION. Validado en la aplicación.',
  })
  @ForeignKey('Estacion', { name: 'fk_usuario_estacion', onDelete: 'SET NULL' })
  estacionId!: number | null;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo!: boolean;

  @Column({ name: 'creado_en', type: 'timestamptz', default: () => 'now()' })
  creadoEn!: Date;
}
