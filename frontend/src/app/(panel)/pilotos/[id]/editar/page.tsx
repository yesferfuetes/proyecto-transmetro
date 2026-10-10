import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { esquemaId, exigirDatos, FormularioPiloto, obtenerPiloto } from '@/modules/pilotos';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Editar piloto' };

export default async function PaginaEditarPiloto({
  params,
}: PageProps<'/pilotos/[id]/editar'>): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const ficha = exigirDatos(await obtenerPiloto(id.data));
  // El supervisor siempre recibe el expediente completo; una ficha reducida no se edita.
  if (ficha.vista !== 'completa') {
    notFound();
  }
  const { piloto } = ficha;
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina destacado="Editar" resto={`piloto ${piloto.nombre}`} />
      <FormularioPiloto buses={[]} piloto={piloto} />
    </div>
  );
}
