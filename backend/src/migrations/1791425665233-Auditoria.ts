import { MigrationInterface, QueryRunner } from 'typeorm';

/** Constancia de los cambios hechos en el sistema y de los inicios de sesión fallidos. */
export class Auditoria1791425665233 implements MigrationInterface {
  name = 'Auditoria1791425665233';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const sentencia of SENTENCIAS) {
      await queryRunner.query(sentencia);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE transmetro.auditoria');
  }
}

const SENTENCIAS: readonly string[] = [
  `CREATE TABLE transmetro.auditoria (
    id                SERIAL,
    fecha_hora        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    usuario_id        INTEGER,
    correo_intentado  VARCHAR(150),
    accion            VARCHAR(60)  NOT NULL,
    entidad           VARCHAR(40)  NOT NULL,
    entidad_id        VARCHAR(40),
    resumen           TEXT,
    CONSTRAINT pk_auditoria PRIMARY KEY (id),
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id)
      REFERENCES transmetro.usuario (id) ON DELETE RESTRICT
  )`,
  `COMMENT ON TABLE transmetro.auditoria IS 'Constancia de los cambios hechos en el sistema y de los inicios de sesión fallidos.'`,
  `COMMENT ON COLUMN transmetro.auditoria.usuario_id IS 'Quién hizo el cambio; nulo en un inicio de sesión fallido.'`,
  `COMMENT ON COLUMN transmetro.auditoria.correo_intentado IS 'Correo escrito en un inicio de sesión fallido.'`,
  `COMMENT ON COLUMN transmetro.auditoria.accion IS 'Qué ocurrió, por ejemplo USUARIO_DESACTIVADO.'`,
  `COMMENT ON COLUMN transmetro.auditoria.entidad IS 'Tabla del registro afectado.'`,
  `COMMENT ON COLUMN transmetro.auditoria.resumen IS 'Resumen del cambio en JSON. Nunca contiene contraseñas.'`,
  'CREATE INDEX idx_auditoria_fecha_hora ON transmetro.auditoria (fecha_hora)',
  'CREATE INDEX idx_auditoria_entidad ON transmetro.auditoria (entidad, entidad_id)',
];
