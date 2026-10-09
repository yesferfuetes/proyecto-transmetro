import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { FormularioGuardia } from '@/modules/accesos';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Nuevo guardia' };

export default async function PaginaNuevoGuardia(): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Nuevo"
        resto="guardia"
        descripcion="Queda sin asignación hasta que lo asignes a un acceso."
      />
      <FormularioGuardia />
    </div>
  );
}
