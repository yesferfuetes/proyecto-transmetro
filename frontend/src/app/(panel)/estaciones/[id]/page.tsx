import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { DetalleEstacion, esquemaId, exigirDatos, obtenerEstacion } from '@/modules/red';
import { EnlaceBoton } from '@/shared/components/acciones';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Estación' };

export default async function PaginaEstacion({
  params,
}: PageProps<'/estaciones/[id]'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const estacion = exigirDatos(await obtenerEstacion(id.data));
  return (
    <DetalleEstacion
      estacion={estacion}
      esTuEstacion={sesion.rol === 'OPERADOR_ESTACION' && sesion.estacion?.id === estacion.id}
      acciones={
        sesion.rol === 'SUPERVISOR_MUNICIPAL' ? (
          <EnlaceBoton href={`/estaciones/${estacion.id}/editar`} variante="principal">
            Editar estación
          </EnlaceBoton>
        ) : null
      }
    />
  );
}
