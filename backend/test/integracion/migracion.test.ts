import { BaseTemporal, contar, crearBaseTemporal } from './base-temporal';

const ESQUEMA = "connamespace = 'transmetro'::regnamespace";

describe('migración inicial sobre una base vacía', () => {
  let base: BaseTemporal;

  beforeAll(async () => {
    base = await crearBaseTemporal();
    await base.fuente.runMigrations();
  });

  afterAll(async () => {
    await base.eliminar();
  });

  it('crea las 13 tablas en el esquema transmetro', async () => {
    const total = await contar(
      base.fuente,
      "SELECT count(*) AS total FROM information_schema.tables WHERE table_schema = 'transmetro'",
    );
    expect(total).toBe(13);
  });

  it('crea las 16 llaves foráneas', async () => {
    const consulta = `SELECT count(*) AS total FROM pg_constraint WHERE contype = 'f' AND ${ESQUEMA}`;
    expect(await contar(base.fuente, consulta)).toBe(16);
  });

  it('crea solo los 6 CHECK de rango simple', async () => {
    const consulta = `SELECT count(*) AS total FROM pg_constraint WHERE contype = 'c' AND ${ESQUEMA}`;
    expect(await contar(base.fuente, consulta)).toBe(6);
  });

  it('crea los 8 índices de apoyo', async () => {
    const consulta =
      "SELECT count(*) AS total FROM pg_indexes WHERE schemaname = 'transmetro' AND indexname LIKE 'idx\\_%'";
    expect(await contar(base.fuente, consulta)).toBe(8);
  });

  it('no crea triggers ni funciones', async () => {
    const triggers = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
       WHERE NOT t.tgisinternal AND c.relnamespace = 'transmetro'::regnamespace`,
    );
    const funciones = await contar(
      base.fuente,
      "SELECT count(*) AS total FROM pg_proc WHERE pronamespace = 'transmetro'::regnamespace",
    );
    expect(triggers).toBe(0);
    expect(funciones).toBe(0);
  });

  it('guarda todas las fechas y horas con zona horaria', async () => {
    const consulta = (tipo: string): string =>
      `SELECT count(*) AS total FROM information_schema.columns
       WHERE table_schema = 'transmetro' AND data_type = '${tipo}'`;
    expect(await contar(base.fuente, consulta('timestamp with time zone'))).toBe(4);
    expect(await contar(base.fuente, consulta('timestamp without time zone'))).toBe(0);
  });

  it('deja la tabla de control de migraciones en public', async () => {
    const consulta =
      "SELECT count(*) AS total FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'migrations'";
    expect(await contar(base.fuente, consulta)).toBe(1);
  });

  it('una conexión nueva la reconoce como aplicada', async () => {
    const otra = await base.abrirOtraConexion();
    try {
      expect(await otra.showMigrations()).toBe(false);
    } finally {
      await otra.destroy();
    }
  });

  it('al revertirla elimina el esquema transmetro', async () => {
    await base.fuente.undoLastMigration();
    const consulta =
      "SELECT count(*) AS total FROM information_schema.schemata WHERE schema_name = 'transmetro'";
    expect(await contar(base.fuente, consulta)).toBe(0);
  });
});
