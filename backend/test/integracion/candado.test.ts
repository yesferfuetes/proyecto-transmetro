import { UnidadDeTrabajoTypeorm } from '../../src/shared/database/unidad-de-trabajo';
import { BaseTemporal, crearBaseTemporal } from './base-temporal';

describe('candado transaccional', () => {
  let base: BaseTemporal;

  beforeAll(async () => {
    base = await crearBaseTemporal();
  });

  afterAll(async () => {
    await base.eliminar();
  });

  it('serializa dos transacciones con la misma clave', async () => {
    const otra = await base.abrirOtraConexion();
    const primera = new UnidadDeTrabajoTypeorm(base.fuente);
    const segunda = new UnidadDeTrabajoTypeorm(otra);
    const orden: string[] = [];
    let liberar: () => void = () => undefined;
    const pausa = new Promise<void>((resolver) => {
      liberar = resolver;
    });
    let primeraTieneElCandado: () => void = () => undefined;
    const tomado = new Promise<void>((resolver) => {
      primeraTieneElCandado = resolver;
    });

    const a = primera.ejecutar(async (contexto) => {
      await contexto.bloquear('flota-linea', 7);
      primeraTieneElCandado();
      await pausa;
      orden.push('primera');
    });
    await tomado;
    const b = segunda.ejecutar(async (contexto) => {
      await contexto.bloquear('flota-linea', 7);
      orden.push('segunda');
    });
    await new Promise((resolver) => setTimeout(resolver, 300));
    expect(orden).toEqual([]);
    liberar();
    await Promise.all([a, b]);

    expect(orden).toEqual(['primera', 'segunda']);
    await otra.destroy();
  });

  it('no bloquea claves distintas', async () => {
    const otra = await base.abrirOtraConexion();
    const primera = new UnidadDeTrabajoTypeorm(base.fuente);
    const segunda = new UnidadDeTrabajoTypeorm(otra);
    let terminoSegunda = false;

    await primera.ejecutar(async (contexto) => {
      await contexto.bloquear('flota-linea', 1);
      await segunda.ejecutar(async (otroContexto) => {
        await otroContexto.bloquear('flota-linea', 2);
        terminoSegunda = true;
      });
    });

    expect(terminoSegunda).toBe(true);
    await otra.destroy();
  });
});
