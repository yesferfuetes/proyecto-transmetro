import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { transformadorDecimal } from '../../shared/transformers/decimal';
import { Estacion } from './estacion.entity';
import { Linea } from './linea.entity';

@Entity({
  name: 'linea_estacion',
  schema: 'transmetro',
  comment: 'Resuelve la relación muchos-a-muchos línea<->estación y fija el orden del recorrido.',
})
@Unique('uq_linea_orden', ['lineaId', 'ordenSecuencia'])
@Check('ck_linea_estacion_orden_secuencia', 'orden_secuencia > 0')
@Check(
  'ck_linea_estacion_distancia_siguiente_km',
  'distancia_siguiente_km IS NULL OR distancia_siguiente_km >= 0',
)
export class LineaEstacion {
  @PrimaryColumn({
    name: 'linea_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_linea_estacion',
  })
  lineaId!: number;

  @PrimaryColumn({
    name: 'estacion_id',
    type: 'integer',
    primaryKeyConstraintName: 'pk_linea_estacion',
  })
  estacionId!: number;

  @ManyToOne(() => Linea, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'linea_id', foreignKeyConstraintName: 'fk_linea_estacion_linea' })
  linea?: Linea;

  @ManyToOne(() => Estacion, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'estacion_id', foreignKeyConstraintName: 'fk_linea_estacion_estacion' })
  estacion?: Estacion;

  @Column({ name: 'orden_secuencia', type: 'integer' })
  ordenSecuencia!: number;

  @Column({
    name: 'distancia_siguiente_km',
    type: 'numeric',
    precision: 6,
    scale: 3,
    nullable: true,
    transformer: transformadorDecimal,
    comment:
      'Distancia hacia la siguiente estación de la secuencia; NULL en la última estación de cada línea.',
  })
  distanciaSiguienteKm!: number | null;
}
