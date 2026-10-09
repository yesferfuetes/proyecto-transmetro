import type { ConsultasDeFlota } from '../../../shared/contratos/flota';
import { FlotaAdapter } from './flota.adapter';

describe('FlotaAdapter', () => {
  it('pregunta al contrato de flota si la estación tiene parqueos', async () => {
    const estacionTieneParqueos = jest.fn().mockResolvedValue(true);
    const adaptador = new FlotaAdapter({ estacionTieneParqueos } as unknown as ConsultasDeFlota);

    await expect(adaptador.estacionTieneParqueos(4)).resolves.toBe(true);
    expect(estacionTieneParqueos).toHaveBeenCalledWith(4);
  });
});
