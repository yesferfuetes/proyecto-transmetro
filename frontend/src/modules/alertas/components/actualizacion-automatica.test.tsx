import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { leerHuellaDeAlertas } from '../actions/leer-huella';
import { ActualizacionAutomatica } from './actualizacion-automatica';

const refrescar = vi.fn();

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: refrescar }) }));
vi.mock('../actions/leer-huella', () => ({ leerHuellaDeAlertas: vi.fn() }));

const INICIAL = { pendientes: 1, atendidas: 0, ultimaId: 5 };

function dibujar(): void {
  const cliente = new QueryClient();
  // El intervalo largo deja una sola consulta, la inmediata al montar.
  render(
    <QueryClientProvider client={cliente}>
      <ActualizacionAutomatica huellaInicial={INICIAL} intervaloMs={60000} />
    </QueryClientProvider>,
  );
}

describe('ActualizacionAutomatica', () => {
  beforeEach(() => {
    refrescar.mockReset();
  });

  it('no refresca si la huella es igual', async () => {
    vi.mocked(leerHuellaDeAlertas).mockResolvedValue({ ok: true, datos: { ...INICIAL } });
    dibujar();
    await waitFor(() => expect(leerHuellaDeAlertas).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(refrescar).not.toHaveBeenCalled();
  });

  it('refresca una vez si la huella cambió', async () => {
    vi.mocked(leerHuellaDeAlertas).mockResolvedValue({
      ok: true,
      datos: { pendientes: 2, atendidas: 0, ultimaId: 6 },
    });
    dibujar();
    await waitFor(() => expect(refrescar).toHaveBeenCalledTimes(1));
  });

  it('no refresca si la consulta falla', async () => {
    vi.mocked(leerHuellaDeAlertas).mockResolvedValue({
      ok: false,
      error: { codigo: 'NO_AUTENTICADO', mensaje: 'x', detalles: [], estado: 401 },
    });
    dibujar();
    await waitFor(() => expect(leerHuellaDeAlertas).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(refrescar).not.toHaveBeenCalled();
  });
});
