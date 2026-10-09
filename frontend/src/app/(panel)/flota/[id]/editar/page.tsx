import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { esquemaId, exigirDatos, FormularioBus, obtenerBus } from '@/modules/flota';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Editar bus' };

export default async function PaginaEditarBus({
  params,
}: PageProps<'/flota/[id]/editar'>): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const bus = exigirDatos(await obtenerBus(id.data));
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina destacado="Editar" resto={`bus ${bus.placa}`} />
      <FormularioBus
        parqueos={[]}
        lineas={[]}
        bus={{
          id: bus.id,
          placa: bus.placa,
          capacidadMax: bus.capacidadMax,
          parqueoId: bus.parqueo.id,
        }}
      />
    </div>
  );
}
