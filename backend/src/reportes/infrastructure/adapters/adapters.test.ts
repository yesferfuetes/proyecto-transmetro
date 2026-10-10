import type { ConsultasDeFlota } from '../../../shared/contratos/flota';
import type { ConsultasDeRed } from '../../../shared/contratos/red';
import { BUSES, FLOTA, RED } from '../../services/datos-de-prueba';
import { FlotaAdapter } from './flota.adapter';
import { RedAdapter } from './red.adapter';
import { UsuariosAdapter } from './usuarios.adapter';

describe('adapters de reportes', () => {
  it('RedAdapter pide la red completa al contrato de la red', async () => {
    const obtenerRed = jest.fn().mockResolvedValue(RED);
    const adapter = new RedAdapter({ obtenerRed } as unknown as ConsultasDeRed);

    await expect(adapter.obtenerRed()).resolves.toBe(RED);
    expect(obtenerRed).toHaveBeenCalledTimes(1);
  });

  it('FlotaAdapter pide los buses y el resumen por línea al contrato de la flota', async () => {
    const listarBuses = jest.fn().mockResolvedValue(BUSES);
    const resumenDeFlotaPorLinea = jest.fn().mockResolvedValue(FLOTA);
    const adapter = new FlotaAdapter({
      listarBuses,
      resumenDeFlotaPorLinea,
    } as unknown as ConsultasDeFlota);

    await expect(adapter.listarBuses()).resolves.toBe(BUSES);
    await expect(adapter.resumenDeFlotaPorLinea()).resolves.toBe(FLOTA);
  });

  it('UsuariosAdapter pide los usuarios por id al contrato de usuarios', async () => {
    const usuarios = [{ id: 9, nombre: 'Ana', correo: 'ana@example.com' }];
    const obtenerUsuarios = jest.fn().mockResolvedValue(usuarios);
    const adapter = new UsuariosAdapter({ obtenerUsuarios });

    await expect(adapter.obtenerUsuarios([9])).resolves.toBe(usuarios);
    expect(obtenerUsuarios).toHaveBeenCalledWith([9]);
  });
});
