import { crearRepositorioSimulado } from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Piloto } from '../../entities/piloto.entity';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ObtenerPiloto } from '../impl/obtener-piloto.query';
import { ObtenerPilotoHandler } from './obtener-piloto.handler';

const PILOTO: Piloto = {
  id: 1,
  nombre: 'Carlos Pérez',
  dpi: '1234 56789 0101',
  direccionResidencia: 'Zona 1',
  telefono: '5555-1234',
  email: 'c@correo.com',
  historialEducativo: 'Perito contador',
  busId: 5,
};

function preparar(piloto: Piloto | null = PILOTO): {
  handler: ObtenerPilotoHandler;
  repositorio: ReturnType<typeof crearRepositorioSimulado<Piloto>>;
} {
  const repositorio = crearRepositorioSimulado<Piloto>();
  repositorio.findOneBy.mockResolvedValue(piloto);
  const flota = {
    obtenerBuses: jest
      .fn()
      .mockResolvedValue([
        { id: 5, placa: 'TM-0005', capacidadMax: 100, lineaId: 3, estado: 'BAJA' },
      ]),
  };
  const red = {
    obtenerLineas: jest.fn().mockResolvedValue([{ id: 3, codigo: 'L3', nombre: 'Línea 3' }]),
  };
  const handler = new ObtenerPilotoHandler(
    repositorio,
    flota as unknown as FlotaAdapter,
    red as unknown as RedAdapter,
  );
  return { handler, repositorio };
}

describe('ObtenerPilotoHandler', () => {
  it('devuelve el expediente completo con el aviso de bus de baja', async () => {
    const { handler } = preparar();

    await expect(handler.execute(new ObtenerPiloto(1, true))).resolves.toEqual({
      id: 1,
      nombre: 'Carlos Pérez',
      dpi: '1234 56789 0101',
      direccionResidencia: 'Zona 1',
      telefono: '5555-1234',
      correo: 'c@correo.com',
      historialEducativo: 'Perito contador',
      bus: { id: 5, placa: 'TM-0005', estado: 'BAJA' },
      linea: { id: 3, codigo: 'L3', nombre: 'Línea 3' },
      busDeBaja: true,
    });
  });

  it('la ficha reducida solo trae nombre, bus, línea y teléfono', async () => {
    const { handler } = preparar();

    const ficha = await handler.execute(new ObtenerPiloto(1, false));

    expect(ficha).toEqual({
      id: 1,
      nombre: 'Carlos Pérez',
      telefono: '5555-1234',
      bus: { id: 5, placa: 'TM-0005', estado: 'BAJA' },
      linea: { id: 3, codigo: 'L3', nombre: 'Línea 3' },
      busDeBaja: true,
    });
    for (const campo of ['dpi', 'direccionResidencia', 'correo', 'email', 'historialEducativo']) {
      expect(ficha).not.toHaveProperty(campo);
    }
    expect(JSON.stringify(ficha)).not.toMatch(/1234 56789|Zona 1|correo\.com|Perito/);
  });

  it('un piloto sin bus no tiene bus ni línea', async () => {
    const { handler } = preparar({ ...PILOTO, busId: null });

    await expect(handler.execute(new ObtenerPiloto(1, false))).resolves.toMatchObject({
      bus: null,
      linea: null,
      busDeBaja: false,
    });
  });

  it('devuelve nulo si no existe', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(new ObtenerPiloto(99, true))).resolves.toBeNull();
  });

  it('solo lee: no escribe en el repositorio', async () => {
    const { handler, repositorio } = preparar();

    await handler.execute(new ObtenerPiloto(1, true));

    expect(repositorio.save.mock.calls).toHaveLength(0);
    expect(repositorio.update.mock.calls).toHaveLength(0);
    expect(repositorio.insert.mock.calls).toHaveLength(0);
    expect(repositorio.delete.mock.calls).toHaveLength(0);
  });
});
