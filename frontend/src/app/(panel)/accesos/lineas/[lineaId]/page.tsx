import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { AccesosDeLinea, esquemaId, exigirDatos, listarAccesosDeLinea } from '@/modules/accesos';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Accesos de la línea' };

export default async function PaginaAccesosDeLinea({
  params,
}: PageProps<'/accesos/lineas/[lineaId]'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const lineaId = esquemaId.safeParse((await params).lineaId);
  if (!lineaId.success) {
    notFound();
  }
  const datos = exigirDatos(await listarAccesosDeLinea(lineaId.data));
  return (
    <AccesosDeLinea
      datos={datos}
      estacionResaltadaId={sesion.rol === 'OPERADOR_ESTACION' ? sesion.estacion?.id : undefined}
    />
  );
}
