import { useState, useTransition } from 'react';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { exportarReporte } from '../actions/exportar-reporte';
import type { SolicitudDeReporte } from '../schemas/consulta';
import { descargarArchivo } from './descargar-archivo';

type Exportacion = Readonly<{
  pendiente: boolean;
  error: ErrorDeBackend | null;
  exportar: () => void;
}>;

/** Pide el archivo a la acción de servidor y, si llega, lo descarga; si no, guarda el error. */
export function useExportacion(solicitud: SolicitudDeReporte): Exportacion {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<ErrorDeBackend | null>(null);
  const exportar = (): void => {
    iniciar(async () => {
      const resultado = await exportarReporte(solicitud);
      if (resultado.ok) {
        descargarArchivo(resultado.archivo);
      }
      setError(resultado.ok ? null : resultado.error);
    });
  };
  return { pendiente, error, exportar };
}
