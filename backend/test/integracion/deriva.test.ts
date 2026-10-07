import { BaseTemporal, crearBaseTemporal } from './base-temporal';

describe('entidades frente al esquema migrado', () => {
  let base: BaseTemporal;

  beforeAll(async () => {
    base = await crearBaseTemporal();
    await base.fuente.runMigrations();
  });

  afterAll(async () => {
    await base.eliminar();
  });

  it('no tienen diferencias: el ORM no propone ningún cambio', async () => {
    const cambios = await base.fuente.driver.createSchemaBuilder().log();
    expect(cambios.upQueries.map((consulta) => consulta.query)).toEqual([]);
  });
});
