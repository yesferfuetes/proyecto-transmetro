import type { IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { Bus } from '../../src/flota/entities/bus.entity';
import { ConsultasDeFlotaAdapter } from '../../src/flota/infrastructure/adapters/consultas-de-flota.adapter';
import { RedAdapter as RedDeFlota } from '../../src/flota/infrastructure/adapters/red.adapter';
import { ListarBusesParaReporteHandler } from '../../src/flota/queries/handlers/listar-buses-para-reporte.handler';
import { ListarFlotaPorLineaHandler } from '../../src/flota/queries/handlers/listar-flota-por-linea.handler';
import { ListarBusesParaReporte } from '../../src/flota/queries/impl/listar-buses-para-reporte.query';
import { ListarFlotaPorLinea } from '../../src/flota/queries/impl/listar-flota-por-linea.query';
import { Estacion } from '../../src/red/entities/estacion.entity';
import { LineaEstacion } from '../../src/red/entities/linea-estacion.entity';
import { Linea } from '../../src/red/entities/linea.entity';
import { Municipalidad } from '../../src/red/entities/municipalidad.entity';
import { ConsultasDeRedAdapter } from '../../src/red/infrastructure/adapters/consultas-de-red.adapter';
import { ListarEstacionesDeLineaHandler } from '../../src/red/queries/handlers/listar-estaciones-de-linea.handler';
import { ObtenerLineasResumenHandler } from '../../src/red/queries/handlers/obtener-lineas-resumen.handler';
import { ObtenerRedCompletaHandler } from '../../src/red/queries/handlers/obtener-red-completa.handler';
import { ListarEstacionesDeLinea } from '../../src/red/queries/impl/listar-estaciones-de-linea.query';
import { ObtenerLineasResumen } from '../../src/red/queries/impl/obtener-lineas-resumen.query';
import { ObtenerRedCompleta } from '../../src/red/queries/impl/obtener-red-completa.query';
import { sembrar } from '../../src/seeds/sembrar';
import { Usuario } from '../../src/usuarios/entities/usuario.entity';
import { ConsultasDeUsuariosAdapter } from '../../src/usuarios/infrastructure/adapters/consultas-de-usuarios.adapter';
import { ObtenerUsuariosResumenHandler } from '../../src/usuarios/queries/handlers/obtener-usuarios-resumen.handler';
import { ObtenerUsuariosResumen } from '../../src/usuarios/queries/impl/obtener-usuarios-resumen.query';
import { BaseTemporal, crearBaseTemporal } from './base-temporal';

type Manejador = IQueryHandler<object, unknown>;

function buzDeConsultas(manejadores: Map<object, Manejador>): QueryBus {
  return {
    execute: (consulta: object): Promise<unknown> => {
      const manejador = manejadores.get(consulta.constructor);
      if (!manejador) {
        throw new Error(`Sin manejador para ${consulta.constructor.name}`);
      }
      return manejador.execute(consulta);
    },
  } as unknown as QueryBus;
}

describe('contratos compartidos sobre la base sembrada', () => {
  let base: BaseTemporal;
  let red: ConsultasDeRedAdapter;
  let flota: ConsultasDeFlotaAdapter;
  let usuarios: ConsultasDeUsuariosAdapter;

  beforeAll(async () => {
    base = await crearBaseTemporal();
    await base.fuente.runMigrations();
    await sembrar(base.fuente, { contrasenaDeUsuarios: 'Demo2026x' });

    const { fuente } = base;
    const manejadores = new Map<object, Manejador>();
    const bus = buzDeConsultas(manejadores);
    red = new ConsultasDeRedAdapter(bus);
    flota = new ConsultasDeFlotaAdapter(bus);
    usuarios = new ConsultasDeUsuariosAdapter(bus);
    manejadores.set(
      ObtenerRedCompleta,
      new ObtenerRedCompletaHandler(
        fuente.getRepository(Municipalidad),
        fuente.getRepository(Linea),
        fuente.getRepository(Estacion),
        fuente.getRepository(LineaEstacion),
      ),
    );
    manejadores.set(
      ObtenerLineasResumen,
      new ObtenerLineasResumenHandler(fuente.getRepository(Linea)),
    );
    manejadores.set(
      ListarEstacionesDeLinea,
      new ListarEstacionesDeLineaHandler(fuente.getRepository(LineaEstacion)),
    );
    manejadores.set(
      ListarBusesParaReporte,
      new ListarBusesParaReporteHandler(fuente.getRepository(Bus)),
    );
    manejadores.set(
      ListarFlotaPorLinea,
      new ListarFlotaPorLineaHandler(fuente.getRepository(Bus), new RedDeFlota(red)),
    );
    manejadores.set(
      ObtenerUsuariosResumen,
      new ObtenerUsuariosResumenHandler(fuente.getRepository(Usuario)),
    );
  });

  afterAll(async () => {
    await base.eliminar();
  });

  it('obtenerRed trae 8 líneas, 99 estaciones y 2 municipalidades con el recorrido en orden', async () => {
    const { municipalidades, lineas, estaciones } = await red.obtenerRed();

    expect(lineas).toHaveLength(8);
    expect(estaciones).toHaveLength(99);
    expect(municipalidades).toHaveLength(2);
    for (const linea of lineas) {
      expect(linea.estacionIds).toHaveLength(linea.numeroDeEstaciones);
      expect(new Set(linea.estacionIds).size).toBe(linea.estacionIds.length);
      expect(linea.estacionIds).toEqual((await red.estacionesDeLinea(linea.id)).map((e) => e.id));
    }
  });

  it('listarBuses trae los 113 buses con parqueo y resumenDeFlotaPorLinea una fila por línea', async () => {
    const buses = await flota.listarBuses();
    const resumen = await flota.resumenDeFlotaPorLinea();

    expect(buses).toHaveLength(113);
    expect(buses.every((bus) => bus.parqueo.id > 0)).toBe(true);
    expect(buses.map((bus) => bus.placa)).toEqual([...buses.map((bus) => bus.placa)].sort());
    expect(resumen).toHaveLength(8);
    expect(new Set(resumen.map((fila) => fila.lineaId)).size).toBe(8);
  });

  it('obtenerUsuarios nombra a los usuarios sembrados', async () => {
    const encontrados = await usuarios.obtenerUsuarios([1, 2, 3, 999999]);

    expect(encontrados.length).toBeGreaterThan(0);
    expect(encontrados.every((u) => u.correo.endsWith('@transmetro.test'))).toBe(true);
    expect(encontrados.find((u) => u.id === 999999)).toBeUndefined();
  });
});
