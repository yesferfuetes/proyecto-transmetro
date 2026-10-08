import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  esquemaId,
  exigirDatos,
  FormularioMunicipalidad,
  obtenerMunicipalidad,
} from '@/modules/red';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Editar municipalidad' };

export default async function PaginaEditarMunicipalidad({
  params,
}: PageProps<'/municipalidades/[id]/editar'>): Promise<ReactElement> {
  await exigirSesion(['ADMINISTRADOR']);
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const municipalidad = exigirDatos(await obtenerMunicipalidad(id.data));
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina destacado="Editar" resto={municipalidad.nombre} />
      <FormularioMunicipalidad municipalidad={municipalidad} />
    </div>
  );
}
