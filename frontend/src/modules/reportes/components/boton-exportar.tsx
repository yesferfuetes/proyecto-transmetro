'use client';

import type { ReactElement } from 'react';
import { Boton } from '@/shared/components/acciones';
import { Aviso } from '@/shared/components/superposiciones';
import { useExportacion } from '../hooks/use-exportacion';
import type { SolicitudDeReporte } from '../schemas/consulta';

type Propiedades = Readonly<{ solicitud: SolicitudDeReporte }>;

/** Exporta todas las filas del reporte a un archivo CSV; deja una constancia más. */
export function BotonExportar({ solicitud }: Propiedades): ReactElement {
  const { pendiente, error, exportar } = useExportacion(solicitud);
  return (
    <div className="flex flex-col gap-3">
      <Boton variante="secundario" cargando={pendiente} onClick={exportar}>
        Exportar
      </Boton>
      {error ? <Aviso estado="error" titulo={error.mensaje} /> : null}
    </div>
  );
}
