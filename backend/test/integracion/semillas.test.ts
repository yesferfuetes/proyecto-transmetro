import { verificarContrasena } from '../../src/shared/seguridad/cifrador-de-contrasenas';
import { normalizarTurno, turnosSeTraslapan } from '../../src/accesos/services/turnos';
import { sembrar } from '../../src/seeds/sembrar';
import { BaseTemporal, contar, crearBaseTemporal } from './base-temporal';

const CONTRASENA = 'Demo2026x';
const OPCIONES = { contrasenaDeUsuarios: CONTRASENA };

describe('datos semilla', () => {
  let base: BaseTemporal;

  beforeAll(async () => {
    base = await crearBaseTemporal();
    await base.fuente.runMigrations();
    await sembrar(base.fuente, OPCIONES);
  });

  afterAll(async () => {
    await base.eliminar();
  });

  it('una segunda siembra no inserta ni actualiza nada', async () => {
    const resumen = await sembrar(base.fuente, OPCIONES);
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

  it('siembra un administrador, un supervisor y un operador por primera estación elegida', async () => {
    const filas = await base.fuente.query<{ email: string; rol: string; codigo: string | null }[]>(
      `SELECT u.email, u.rol, e.codigo FROM transmetro.usuario u
       LEFT JOIN transmetro.estacion e ON e.id = u.estacion_id ORDER BY u.email`,
    );
    expect(filas).toEqual([
      { email: 'admin@transmetro.test', rol: 'ADMINISTRADOR', codigo: null },
      { email: 'operador.e001@transmetro.test', rol: 'OPERADOR_ESTACION', codigo: 'E001' },
      expect.objectContaining({ rol: 'OPERADOR_ESTACION' }),
      { email: 'supervisor@transmetro.test', rol: 'SUPERVISOR_MUNICIPAL', codigo: null },
    ]);
  });

  it('cumple las reglas de usuarios: rol válido, estación solo para operadores, correo único', async () => {
    const incumplen = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM transmetro.usuario u
       WHERE u.rol NOT IN ('OPERADOR_ESTACION', 'SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR')
          OR (u.rol = 'OPERADOR_ESTACION' AND u.estacion_id IS NULL)
          OR (u.rol <> 'OPERADOR_ESTACION' AND u.estacion_id IS NOT NULL)
          OR u.email <> lower(trim(u.email))
          OR NOT u.activo`,
    );
    const administradores = await contar(
      base.fuente,
      "SELECT count(*) AS total FROM transmetro.usuario WHERE rol = 'ADMINISTRADOR' AND activo",
    );
    expect(incumplen).toBe(0);
    expect(administradores).toBeGreaterThanOrEqual(1);
  });

  it('cada usuario sembrado entra con la contraseña de la siembra, guardada cifrada', async () => {
    const filas = await base.fuente.query<{ password_hash: string }[]>(
      'SELECT password_hash FROM transmetro.usuario',
    );
    for (const fila of filas) {
      expect(fila.password_hash).not.toContain(CONTRASENA);
      await expect(verificarContrasena(CONTRASENA, fila.password_hash)).resolves.toBe(true);
    }
  });

  it('una segunda siembra con otra contraseña no cambia las de los usuarios existentes', async () => {
    await sembrar(base.fuente, { contrasenaDeUsuarios: 'Distinta2026' });
    const [fila] = await base.fuente.query<{ password_hash: string }[]>(
      "SELECT password_hash FROM transmetro.usuario WHERE email = 'admin@transmetro.test'",
    );
    await expect(verificarContrasena(CONTRASENA, fila?.password_hash ?? '')).resolves.toBe(true);
  });

  it('deja recorridos coherentes: posiciones 1..n sin huecos y sin estaciones repetidas', async () => {
    const huecos = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM (
         SELECT linea_id, count(*) AS n, max(orden_secuencia) AS maximo, min(orden_secuencia) AS minimo,
                count(DISTINCT estacion_id) AS distintas
         FROM transmetro.linea_estacion GROUP BY linea_id
       ) r WHERE r.minimo <> 1 OR r.maximo <> r.n OR r.distintas <> r.n`,
    );
    expect(huecos).toBe(0);
  });

  it('pone toda estación en alguna línea y toda línea activa con al menos dos estaciones', async () => {
    const sinLinea = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM transmetro.estacion e
       WHERE NOT EXISTS (SELECT 1 FROM transmetro.linea_estacion le WHERE le.estacion_id = e.id)`,
    );
    const activasCortas = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM transmetro.linea l
       WHERE l.estado = 'ACTIVA'
         AND (SELECT count(*) FROM transmetro.linea_estacion le WHERE le.linea_id = l.id) < 2`,
    );
    expect(sinLinea).toBe(0);
    expect(activasCortas).toBe(0);
  });

  it('usa códigos en mayúsculas para líneas y estaciones', async () => {
    const minusculas = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM (
         SELECT codigo FROM transmetro.linea UNION ALL SELECT codigo FROM transmetro.estacion
       ) c WHERE c.codigo <> upper(trim(c.codigo))`,
    );
    expect(minusculas).toBe(0);
  });

  it('da a todo bus un parqueo y pone todo parqueo en una estación con la marca de parqueo', async () => {
    const sinParqueo = await contar(
      base.fuente,
      'SELECT count(*) AS total FROM transmetro.bus WHERE parqueo_id IS NULL',
    );
    const enEstacionSinMarca = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM transmetro.parqueo p
       JOIN transmetro.estacion e ON e.id = p.estacion_id WHERE NOT e.tiene_parqueo`,
    );
    expect(sinParqueo).toBe(0);
    expect(enEstacionSinMarca).toBe(0);
  });

  it('guarda todo turno normalizado y sin traslapes entre estaciones distintas', async () => {
    const asignaciones = await base.fuente.query<
      { guardia_id: number; acceso_id: number; estacion_id: number; turno: string }[]
    >(
      `SELECT ag.guardia_id, ag.acceso_id, a.estacion_id, ag.turno
       FROM transmetro.acceso_guardia ag JOIN transmetro.acceso a ON a.id = ag.acceso_id`,
    );
    expect(asignaciones.length).toBeGreaterThan(0);
    expect(asignaciones.filter((fila) => normalizarTurno(fila.turno) !== fila.turno)).toEqual([]);

    const traslapes = asignaciones.flatMap((a, i) =>
      asignaciones
        .slice(i + 1)
        .filter(
          (b) =>
            a.guardia_id === b.guardia_id &&
            a.estacion_id !== b.estacion_id &&
            turnosSeTraslapan(a.turno, b.turno),
        ),
    );
    expect(traslapes).toEqual([]);
  });

  it('siembra 113 pilotos, todos con bus y con sus datos personales completos', async () => {
    const total = await contar(base.fuente, 'SELECT count(*) AS total FROM transmetro.piloto');
    const sinBus = await contar(
      base.fuente,
      'SELECT count(*) AS total FROM transmetro.piloto WHERE bus_id IS NULL',
    );
    const incompletos = await contar(
      base.fuente,
      `SELECT count(*) AS total FROM transmetro.piloto p
       WHERE length(regexp_replace(p.dpi, '[^0-9]', '', 'g')) <> 13
          OR length(regexp_replace(coalesce(p.telefono, ''), '[^0-9]', '', 'g')) <> 8
          OR coalesce(trim(p.direccion_residencia), '') = ''
          OR coalesce(trim(p.historial_educativo), '') = ''`,
    );
    const dpiRepetidos = await contar(
      base.fuente,
      'SELECT count(*) AS total FROM (SELECT dpi FROM transmetro.piloto GROUP BY dpi HAVING count(*) > 1) d',
    );
    expect(total).toBe(113);
    expect(sinBus).toBe(0);
    expect(incompletos).toBe(0);
    expect(dpiRepetidos).toBe(0);
  });

  it('empieza sin alertas de capacidad', async () => {
    expect(
      await contar(base.fuente, 'SELECT count(*) AS total FROM transmetro.alerta_capacidad'),
    ).toBe(0);
  });
});
