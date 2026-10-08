import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  CambioDeEstadoLinea,
  DetalleLinea,
  esquemaId,
  exigirDatos,
  obtenerLinea,
} from '@/modules/red';
import { EnlaceBoton } from '@/shared/components/acciones';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Línea' };

export default async function PaginaLinea({
  params,
}: PageProps<'/lineas/[id]'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const linea = exigirDatos(await obtenerLinea(id.data));
  const esSupervisor = sesion.rol === 'SUPERVISOR_MUNICIPAL';
  return (
    <DetalleLinea
      linea={linea}
      estacionResaltadaId={sesion.rol === 'OPERADOR_ESTACION' ? sesion.estacion?.id : undefined}
      acciones={
        esSupervisor ? (
          <>
            <EnlaceBoton href={`/lineas/${linea.id}/recorrido`} variante="principal" icono="lineas">
              Editar recorrido
            </EnlaceBoton>
            <EnlaceBoton href={`/lineas/${linea.id}/editar`} variante="secundario">
              Editar línea
            </EnlaceBoton>
          </>
        ) : null
      }
      cambioDeEstado={
        esSupervisor ? (
          <CambioDeEstadoLinea key={linea.estado} lineaId={linea.id} estado={linea.estado} />
        ) : null
      }
    />
  );
}
