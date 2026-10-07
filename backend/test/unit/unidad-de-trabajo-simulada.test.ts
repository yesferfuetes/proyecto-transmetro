import {
  crearRepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../utilidades/unidad-de-trabajo-simulada';

class EntidadDePrueba {
  id!: number;
}

describe('UnidadDeTrabajoSimulada', () => {
  it('entrega el repositorio registrado y cuenta las ejecuciones', async () => {
    const unidad = new UnidadDeTrabajoSimulada();
    const repositorio = unidad.registrar(EntidadDePrueba, crearRepositorioSimulado());
    repositorio.count.mockResolvedValue(3);

    const total = await unidad.ejecutar((contexto) =>
      contexto.repositorio(EntidadDePrueba).count(),
    );

    expect(total).toBe(3);
    expect(unidad.ejecuciones).toBe(1);
  });

  it('falla si se pide un repositorio que no se registró', async () => {
    const unidad = new UnidadDeTrabajoSimulada();
    await expect(
      unidad.ejecutar((contexto) => contexto.repositorio(EntidadDePrueba).count()),
    ).rejects.toThrow('no registrado');
  });
});
