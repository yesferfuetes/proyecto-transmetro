import { sembrar } from '../../src/seeds/sembrar';
import { BaseTemporal, contar, crearBaseTemporal } from './base-temporal';

describe('datos semilla', () => {
  let base: BaseTemporal;

  beforeAll(async () => {
    base = await crearBaseTemporal();
    await base.fuente.runMigrations();
    await sembrar(base.fuente);
  });

  afterAll(async () => {
    await base.eliminar();
  });

  it('una segunda siembra no inserta ni actualiza nada', async () => {
    const resumen = await sembrar(base.fuente);
    for (const conteo of Object.values(resumen)) {
      expect(conteo.insertados).toBe(0);
      expect(conteo.actualizados).toBe(0);
    }
  });

  it('carga las 8 líneas y las 99 estaciones de la red', async () => {
    expect(await contar(base.fuente, 'SELECT count(*) AS total FROM transmetro.linea')).toBe(8);
    expect(await contar(base.fuente, 'SELECT count(*) AS total FROM transmetro.estacion')).toBe(99);
  });

  it('asigna a cada línea entre tantos buses como estaciones y el doble', async () => {
    const fueraDeRango = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM (
         SELECT l.id,
                (SELECT count(*) FROM transmetro.linea_estacion le WHERE le.linea_id = l.id) AS estaciones,
                (SELECT count(*) FROM transmetro.bus b WHERE b.linea_id = l.id) AS buses
         FROM transmetro.linea l
       ) conteo
       WHERE buses < estaciones OR buses > 2 * estaciones`,
    );
    expect(fueraDeRango).toBe(0);
  });

  it('deja la longitud de cada línea igual a la suma de las distancias de su recorrido', async () => {
    const incoherentes = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM transmetro.linea l
       WHERE l.longitud_km IS DISTINCT FROM (
         SELECT sum(le.distancia_siguiente_km) FROM transmetro.linea_estacion le
         WHERE le.linea_id = l.id
       )`,
    );
    expect(incoherentes).toBe(0);
  });

  it('da distancia positiva a toda estación salvo la última de cada recorrido', async () => {
    const incorrectas = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM transmetro.linea_estacion le
       WHERE (le.orden_secuencia < (SELECT max(x.orden_secuencia) FROM transmetro.linea_estacion x
                                    WHERE x.linea_id = le.linea_id)
              AND (le.distancia_siguiente_km IS NULL OR le.distancia_siguiente_km <= 0))
          OR (le.orden_secuencia = (SELECT max(x.orden_secuencia) FROM transmetro.linea_estacion x
                                    WHERE x.linea_id = le.linea_id)
              AND le.distancia_siguiente_km IS NOT NULL)`,
    );
    expect(incorrectas).toBe(0);
  });

  it('cubre cada acceso con al menos un guardia', async () => {
    const sinGuardia = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM transmetro.acceso a
       WHERE NOT EXISTS (SELECT 1 FROM transmetro.acceso_guardia ag WHERE ag.acceso_id = a.id)`,
    );
    expect(sinGuardia).toBe(0);
  });

  it('no excede la capacidad de ningún parqueo', async () => {
    const excedidos = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM transmetro.parqueo p
       WHERE (SELECT count(*) FROM transmetro.bus b WHERE b.parqueo_id = p.id) > p.capacidad_vehiculos`,
    );
    expect(excedidos).toBe(0);
  });
});
