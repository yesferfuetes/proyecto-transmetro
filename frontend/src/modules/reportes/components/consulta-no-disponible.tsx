import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { EstadoVacio } from '@/shared/components/datos';

/** La constancia de la URL no existe o no es de quien la abre: se pide generar el reporte otra vez. */
export function ConsultaNoDisponible(): ReactElement {
  return (
    <div className="rounded-xl border border-border bg-surface">
      <EstadoVacio
        variante="sin-datos"
        titulo="Este reporte no está disponible"
        texto="No encontramos la consulta de este reporte. Genera el reporte de nuevo."
        accion={
          <EnlaceBoton href="/reportes" variante="secundario">
            Generar un reporte
          </EnlaceBoton>
        }
      />
    </div>
  );
}
