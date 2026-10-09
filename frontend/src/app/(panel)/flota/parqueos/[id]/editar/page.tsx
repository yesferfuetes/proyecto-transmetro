import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { esquemaId, exigirDatos, FormularioParqueo, obtenerParqueo } from '@/modules/flota';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Editar parqueo' };

export default async function PaginaEditarParqueo({
  params,
}: PageProps<'/flota/parqueos/[id]/editar'>): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const parqueo = exigirDatos(await obtenerParqueo(id.data));
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Editar"
        resto={`parqueo ${parqueo.codigo} de ${parqueo.estacion.nombre}`}
      />
      <FormularioParqueo
        estaciones={[]}
        parqueo={{
          id: parqueo.id,
          estacionId: parqueo.estacion.id,
          codigo: parqueo.codigo,
          capacidadVehiculos: parqueo.capacidadVehiculos,
        }}
      />
    </div>
  );
}
