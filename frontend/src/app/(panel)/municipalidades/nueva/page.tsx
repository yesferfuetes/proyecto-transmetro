import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { FormularioMunicipalidad } from '@/modules/red';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Nueva municipalidad' };

export default async function PaginaNuevaMunicipalidad(): Promise<ReactElement> {
  await exigirSesion(['ADMINISTRADOR']);
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Nueva"
        resto="municipalidad"
        descripcion="Queda disponible para asignarla a líneas y estaciones."
      />
      <FormularioMunicipalidad />
    </div>
  );
}
