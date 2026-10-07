import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Esquema inicial. La base solo garantiza integridad estructural: llaves, obligatoriedad,
 * unicidad y rangos simples. Las reglas de negocio se validan en los command handlers.
 */
export class EsquemaInicial1791348294000 implements MigrationInterface {
  name = 'EsquemaInicial1791348294000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const sentencia of SENTENCIAS) {
      await queryRunner.query(sentencia);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP SCHEMA transmetro CASCADE');
  }
}

const SENTENCIAS: readonly string[] = [
  'CREATE SCHEMA transmetro',

  `CREATE TABLE transmetro.municipalidad (
    id                   SERIAL,
    nombre               VARCHAR(150) NOT NULL,
    departamento         VARCHAR(100),
    fecha_incorporacion  DATE,
    CONSTRAINT pk_municipalidad PRIMARY KEY (id),
    CONSTRAINT uq_municipalidad_nombre UNIQUE (nombre)
  )`,
  `COMMENT ON TABLE transmetro.municipalidad IS 'Municipalidad propietaria de líneas y estaciones.'`,

  `CREATE TABLE transmetro.linea (
    id                SERIAL,
    codigo            VARCHAR(10) NOT NULL,
    nombre            VARCHAR(150) NOT NULL,
    municipalidad_id  INTEGER NOT NULL,
    longitud_km       NUMERIC(6,3),
    estado            VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_linea PRIMARY KEY (id),
    CONSTRAINT uq_linea_codigo UNIQUE (codigo),
    CONSTRAINT fk_linea_municipalidad FOREIGN KEY (municipalidad_id)
      REFERENCES transmetro.municipalidad (id),
    CONSTRAINT ck_linea_longitud_km CHECK (longitud_km IS NULL OR longitud_km >= 0)
  )`,
  `COMMENT ON TABLE transmetro.linea IS 'Una línea es una secuencia ordenada de estaciones.'`,
  `COMMENT ON COLUMN transmetro.linea.longitud_km IS 'Longitud total; se recalcula a partir de linea_estacion.distancia_siguiente_km.'`,
  `COMMENT ON COLUMN transmetro.linea.estado IS 'ACTIVA | INACTIVA | EN_CONSTRUCCION. Validado en la aplicación.'`,

  `CREATE TABLE transmetro.estacion (
    id                SERIAL,
    codigo            VARCHAR(10) NOT NULL,
    nombre            VARCHAR(150) NOT NULL,
    municipalidad_id  INTEGER NOT NULL,
    tiene_parqueo     BOOLEAN NOT NULL DEFAULT FALSE,
    latitud           NUMERIC(9,6),
    longitud          NUMERIC(9,6),
    CONSTRAINT pk_estacion PRIMARY KEY (id),
    CONSTRAINT uq_estacion_codigo UNIQUE (codigo),
    CONSTRAINT fk_estacion_municipalidad FOREIGN KEY (municipalidad_id)
      REFERENCES transmetro.municipalidad (id)
  )`,
  `COMMENT ON TABLE transmetro.estacion IS 'Una estación puede pertenecer a varias líneas y tener varios accesos.'`,

  `CREATE TABLE transmetro.linea_estacion (
    linea_id                INTEGER NOT NULL,
    estacion_id             INTEGER NOT NULL,
    orden_secuencia         INTEGER NOT NULL,
    distancia_siguiente_km  NUMERIC(6,3),
    CONSTRAINT pk_linea_estacion PRIMARY KEY (linea_id, estacion_id),
    CONSTRAINT uq_linea_orden UNIQUE (linea_id, orden_secuencia),
    CONSTRAINT fk_linea_estacion_linea FOREIGN KEY (linea_id)
      REFERENCES transmetro.linea (id) ON DELETE CASCADE,
    CONSTRAINT fk_linea_estacion_estacion FOREIGN KEY (estacion_id)
      REFERENCES transmetro.estacion (id) ON DELETE RESTRICT,
    CONSTRAINT ck_linea_estacion_orden_secuencia CHECK (orden_secuencia > 0),
    CONSTRAINT ck_linea_estacion_distancia_siguiente_km
      CHECK (distancia_siguiente_km IS NULL OR distancia_siguiente_km >= 0)
  )`,
  `COMMENT ON TABLE transmetro.linea_estacion IS 'Resuelve la relación muchos-a-muchos línea<->estación y fija el orden del recorrido.'`,
  `COMMENT ON COLUMN transmetro.linea_estacion.distancia_siguiente_km IS 'Distancia hacia la siguiente estación de la secuencia; NULL en la última estación de cada línea.'`,

  `CREATE TABLE transmetro.acceso (
    id           SERIAL,
    estacion_id  INTEGER NOT NULL,
    codigo       VARCHAR(10) NOT NULL,
    nombre       VARCHAR(100),
    CONSTRAINT pk_acceso PRIMARY KEY (id),
    CONSTRAINT uq_acceso_estacion_codigo UNIQUE (estacion_id, codigo),
    CONSTRAINT fk_acceso_estacion FOREIGN KEY (estacion_id)
      REFERENCES transmetro.estacion (id) ON DELETE CASCADE
  )`,
  `COMMENT ON TABLE transmetro.acceso IS 'Un acceso pertenece exclusivamente a una estación.'`,

  `CREATE TABLE transmetro.guardia_seguridad (
    id        SERIAL,
    nombre    VARCHAR(150) NOT NULL,
    dpi       VARCHAR(20) NOT NULL,
    telefono  VARCHAR(20),
    CONSTRAINT pk_guardia_seguridad PRIMARY KEY (id),
    CONSTRAINT uq_guardia_seguridad_dpi UNIQUE (dpi)
  )`,
  `COMMENT ON TABLE transmetro.guardia_seguridad IS 'Personal de seguridad asignable a uno o varios accesos, por turno.'`,

  `CREATE TABLE transmetro.acceso_guardia (
    acceso_id   INTEGER NOT NULL,
    guardia_id  INTEGER NOT NULL,
    turno       VARCHAR(20) NOT NULL,
    CONSTRAINT pk_acceso_guardia PRIMARY KEY (acceso_id, guardia_id, turno),
    CONSTRAINT fk_acceso_guardia_acceso FOREIGN KEY (acceso_id)
      REFERENCES transmetro.acceso (id) ON DELETE CASCADE,
    CONSTRAINT fk_acceso_guardia_guardia_seguridad FOREIGN KEY (guardia_id)
      REFERENCES transmetro.guardia_seguridad (id) ON DELETE RESTRICT
  )`,
  `COMMENT ON TABLE transmetro.acceso_guardia IS 'Asignación de guardias a accesos por turno.'`,

  `CREATE TABLE transmetro.parqueo (
    id                   SERIAL,
    estacion_id          INTEGER NOT NULL,
    codigo               VARCHAR(10) NOT NULL,
    capacidad_vehiculos  INTEGER NOT NULL,
    CONSTRAINT pk_parqueo PRIMARY KEY (id),
    CONSTRAINT uq_parqueo_estacion_codigo UNIQUE (estacion_id, codigo),
    CONSTRAINT fk_parqueo_estacion FOREIGN KEY (estacion_id)
      REFERENCES transmetro.estacion (id) ON DELETE CASCADE,
    CONSTRAINT ck_parqueo_capacidad_vehiculos CHECK (capacidad_vehiculos > 0)
  )`,
  `COMMENT ON TABLE transmetro.parqueo IS 'Parqueos disponibles en las estaciones que cuentan con esta infraestructura.'`,

  `CREATE TABLE transmetro.bus (
    id             SERIAL,
    placa          VARCHAR(15) NOT NULL,
    capacidad_max  INTEGER NOT NULL,
    linea_id       INTEGER,
    parqueo_id     INTEGER NOT NULL,
    estado         VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT pk_bus PRIMARY KEY (id),
    CONSTRAINT uq_bus_placa UNIQUE (placa),
    CONSTRAINT fk_bus_linea FOREIGN KEY (linea_id)
      REFERENCES transmetro.linea (id) ON DELETE SET NULL,
    CONSTRAINT fk_bus_parqueo FOREIGN KEY (parqueo_id)
      REFERENCES transmetro.parqueo (id) ON DELETE RESTRICT,
    CONSTRAINT ck_bus_capacidad_max CHECK (capacidad_max > 0)
  )`,
  `COMMENT ON TABLE transmetro.bus IS 'Flota de buses de la red. El rango de buses por línea se valida en la aplicación.'`,
  `COMMENT ON COLUMN transmetro.bus.linea_id IS 'NULL = bus sin línea asignada; un bus nunca está en más de una línea a la vez.'`,
  `COMMENT ON COLUMN transmetro.bus.parqueo_id IS 'NOT NULL: un bus nunca queda sin parqueo asignado, aunque pueda cambiar de parqueo.'`,
  `COMMENT ON COLUMN transmetro.bus.estado IS 'ACTIVO | MANTENIMIENTO | BAJA. Validado en la aplicación.'`,

  `CREATE TABLE transmetro.piloto (
    id                    SERIAL,
    nombre                VARCHAR(150) NOT NULL,
    dpi                   VARCHAR(20) NOT NULL,
    direccion_residencia  VARCHAR(250),
    telefono              VARCHAR(20),
    email                 VARCHAR(150),
    historial_educativo   TEXT,
    bus_id                INTEGER,
    CONSTRAINT pk_piloto PRIMARY KEY (id),
    CONSTRAINT uq_piloto_dpi UNIQUE (dpi),
    CONSTRAINT fk_piloto_bus FOREIGN KEY (bus_id)
      REFERENCES transmetro.bus (id) ON DELETE SET NULL
  )`,
  `COMMENT ON TABLE transmetro.piloto IS 'Expediente de piloto: historial educativo, residencia y comunicación.'`,
  `COMMENT ON COLUMN transmetro.piloto.bus_id IS 'Bus (y por extensión línea) en el que presta servicio actualmente.'`,

  `CREATE TABLE transmetro.usuario (
    id             SERIAL,
    nombre         VARCHAR(150) NOT NULL,
    email          VARCHAR(150) NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    rol            VARCHAR(30) NOT NULL,
    estacion_id    INTEGER,
    activo         BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT uq_usuario_email UNIQUE (email),
    CONSTRAINT fk_usuario_estacion FOREIGN KEY (estacion_id)
      REFERENCES transmetro.estacion (id) ON DELETE SET NULL
  )`,
  `COMMENT ON TABLE transmetro.usuario IS 'Usuarios del sistema con niveles de acceso diferenciados por rol.'`,
  `COMMENT ON COLUMN transmetro.usuario.rol IS 'OPERADOR_ESTACION | SUPERVISOR_MUNICIPAL | ADMINISTRADOR. Validado en la aplicación.'`,
  `COMMENT ON COLUMN transmetro.usuario.estacion_id IS 'Estación de trabajo asignada; obligatoria para el rol OPERADOR_ESTACION. Validado en la aplicación.'`,

  `CREATE TABLE transmetro.alerta_capacidad (
    id                    SERIAL,
    estacion_id           INTEGER NOT NULL,
    bus_id                INTEGER NOT NULL,
    tipo                  VARCHAR(20) NOT NULL,
    porcentaje_ocupacion  NUMERIC(5,2) NOT NULL,
    fecha_hora            TIMESTAMPTZ NOT NULL DEFAULT now(),
    atendida              BOOLEAN NOT NULL DEFAULT FALSE,
    atendida_por          INTEGER,
    CONSTRAINT pk_alerta_capacidad PRIMARY KEY (id),
    CONSTRAINT fk_alerta_capacidad_estacion FOREIGN KEY (estacion_id)
      REFERENCES transmetro.estacion (id),
    CONSTRAINT fk_alerta_capacidad_bus FOREIGN KEY (bus_id)
      REFERENCES transmetro.bus (id),
    CONSTRAINT fk_alerta_capacidad_usuario FOREIGN KEY (atendida_por)
      REFERENCES transmetro.usuario (id),
    CONSTRAINT ck_alerta_capacidad_porcentaje_ocupacion CHECK (porcentaje_ocupacion >= 0)
  )`,
  `COMMENT ON TABLE transmetro.alerta_capacidad IS 'Alertas de capacidad generadas por la aplicación.'`,
  `COMMENT ON COLUMN transmetro.alerta_capacidad.tipo IS 'SOBRECUPO: ocupación >= 150% de la capacidad del bus. BAJA_OCUPACION: < 25%, aplica espera adicional de 5 minutos por estación.'`,

  `CREATE TABLE transmetro.reporte_consulta (
    id            SERIAL,
    usuario_id    INTEGER NOT NULL,
    tipo_reporte  VARCHAR(50) NOT NULL,
    filtros_json  TEXT,
    fecha_hora    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_reporte_consulta PRIMARY KEY (id),
    CONSTRAINT fk_reporte_consulta_usuario FOREIGN KEY (usuario_id)
      REFERENCES transmetro.usuario (id)
  )`,
  `COMMENT ON TABLE transmetro.reporte_consulta IS 'Bitácora de consultas ejecutadas para la generación de reportes.'`,
  `COMMENT ON COLUMN transmetro.reporte_consulta.tipo_reporte IS 'ESTACIONES | LINEAS | BUSES.'`,

  'CREATE INDEX idx_estacion_municipalidad ON transmetro.estacion (municipalidad_id)',
  'CREATE INDEX idx_linea_municipalidad ON transmetro.linea (municipalidad_id)',
  'CREATE INDEX idx_bus_linea ON transmetro.bus (linea_id)',
  'CREATE INDEX idx_bus_parqueo ON transmetro.bus (parqueo_id)',
  'CREATE INDEX idx_piloto_bus ON transmetro.piloto (bus_id)',
  'CREATE INDEX idx_alerta_estacion_fecha ON transmetro.alerta_capacidad (estacion_id, fecha_hora)',
  'CREATE INDEX idx_alerta_bus_fecha ON transmetro.alerta_capacidad (bus_id, fecha_hora)',
  'CREATE INDEX idx_reporte_usuario_fecha ON transmetro.reporte_consulta (usuario_id, fecha_hora)',
];
