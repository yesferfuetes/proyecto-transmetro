import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { esquemaId, exigirDatos, FormularioGuardia, obtenerGuardia } from '@/modules/accesos';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Editar guardia' };

export default async function PaginaEditarGuardia({
  params,
}: PageProps<'/guardias/[id]/editar'>): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const guardia = exigirDatos(await obtenerGuardia(id.data));
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Editar"
        resto={guardia.nombre}
        descripcion="Cambia el nombre, el DPI o el teléfono del guardia."
      />
      <FormularioGuardia
        guardia={{
          id: guardia.id,
          nombre: guardia.nombre,
          dpi: guardia.dpi,
          telefono: guardia.telefono,
        }}
      />
    </div>
  );
}
