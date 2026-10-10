import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { exportarReporte } from '../actions/exportar-reporte';
import { BotonExportar } from './boton-exportar';

vi.mock('../actions/exportar-reporte', () => ({ exportarReporte: vi.fn() }));

const SOLICITUD = { tipo: 'BUSES', lineaId: 1 } as const;
const ARCHIVO = {
  nombreDeArchivo: 'reporte-buses-20261009-1030.csv',
  contenido: 'Placa,Línea\r\nTM-1,1',
};

function leerBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = (): void => resolver(new Uint8Array(lector.result as ArrayBuffer));
    lector.onerror = (): void => rechazar(new Error('No se pudo leer el archivo'));
    lector.readAsArrayBuffer(blob);
  });
}

let crearUrl: ReturnType<typeof vi.fn>;
let clic: MockInstance<() => void>;

beforeEach(() => {
  crearUrl = vi.fn(() => 'blob:prueba');
  Object.assign(URL, { createObjectURL: crearUrl, revokeObjectURL: vi.fn() });
  clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
});

afterEach(() => {
  clic.mockRestore();
});

describe('BotonExportar', () => {
  it('pide el archivo con el mismo tipo y filtros y lo descarga con su nombre', async () => {
    vi.mocked(exportarReporte).mockResolvedValue({ ok: true, archivo: ARCHIVO });
    render(<BotonExportar solicitud={SOLICITUD} />);
    await userEvent.click(screen.getByRole('button', { name: 'Exportar' }));
    await waitFor(() => expect(clic).toHaveBeenCalledTimes(1));
    expect(exportarReporte).toHaveBeenCalledWith(SOLICITUD);
    const descargado = clic.mock.contexts[0] as HTMLAnchorElement;
    expect(descargado.download).toBe(ARCHIVO.nombreDeArchivo);
  });

  it('arma el archivo CSV en UTF-8 con la marca para Excel', async () => {
    vi.mocked(exportarReporte).mockResolvedValue({ ok: true, archivo: ARCHIVO });
    render(<BotonExportar solicitud={SOLICITUD} />);
    await userEvent.click(screen.getByRole('button', { name: 'Exportar' }));
    await waitFor(() => expect(crearUrl).toHaveBeenCalledTimes(1));
    const blob = crearUrl.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toBe('text/csv;charset=utf-8');
    const bytes = await leerBytes(blob);
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes.slice(3))).toBe(ARCHIVO.contenido);
  });

  it('no repite la marca si el backend ya la trae', async () => {
    vi.mocked(exportarReporte).mockResolvedValue({
      ok: true,
      archivo: { ...ARCHIVO, contenido: `﻿${ARCHIVO.contenido}` },
    });
    render(<BotonExportar solicitud={SOLICITUD} />);
    await userEvent.click(screen.getByRole('button', { name: 'Exportar' }));
    await waitFor(() => expect(crearUrl).toHaveBeenCalledTimes(1));
    const bytes = await leerBytes(crearUrl.mock.calls[0]?.[0] as Blob);
    expect([...bytes.slice(3, 6)]).not.toEqual([0xef, 0xbb, 0xbf]);
  });

  it('muestra el error del backend tal cual y no descarga nada', async () => {
    vi.mocked(exportarReporte).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'CONSTANCIA_NO_REGISTRADA',
        mensaje: 'No se pudo dejar constancia de la consulta.',
        detalles: [],
        estado: 500,
      },
    });
    render(<BotonExportar solicitud={SOLICITUD} />);
    await userEvent.click(screen.getByRole('button', { name: 'Exportar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo dejar constancia de la consulta.',
    );
    expect(crearUrl).not.toHaveBeenCalled();
    expect(clic).not.toHaveBeenCalled();
  });
});
