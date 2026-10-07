import { Column, Entity, ForeignKey, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'reporte_consulta',
  schema: 'transmetro',
  comment: 'Bitácora de consultas ejecutadas para la generación de reportes.',
})
@Index('idx_reporte_usuario_fecha', ['usuarioId', 'fechaHora'])
export class ReporteConsulta {
  @PrimaryGeneratedColumn({ name: 'id', primaryKeyConstraintName: 'pk_reporte_consulta' })
  id!: number;

  /** Usuario del módulo usuarios; se referencia por nombre para no importar su entidad. */
  @Column({ name: 'usuario_id', type: 'integer' })
  @ForeignKey('Usuario', { name: 'fk_reporte_consulta_usuario', onDelete: 'NO ACTION' })
  usuarioId!: number;

  @Column({
    name: 'tipo_reporte',
    type: 'varchar',
    length: 50,
    comment: 'ESTACIONES | LINEAS | BUSES.',
  })
  tipoReporte!: string;

  @Column({ name: 'filtros_json', type: 'text', nullable: true })
  filtrosJson!: string | null;

  @Column({ name: 'fecha_hora', type: 'timestamptz', default: () => 'now()' })
  fechaHora!: Date;
}
