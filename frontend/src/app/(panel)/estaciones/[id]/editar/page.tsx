import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  esquemaId,
  exigirDatos,
  FormularioEstacion,
  listarTodasLasMunicipalidades,
  obtenerEstacion,
} from '@/modules/red';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Editar estación' };

export default async function PaginaEditarEstacion({
  params,
}: PageProps<'/estaciones/[id]/editar'>): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const [estacion, municipalidades] = await Promise.all([
    obtenerEstacion(id.data).then(exigirDatos),
    listarTodasLasMunicipalidades().then(exigirDatos),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Editar"
        resto={`${estacion.codigo} · ${estacion.nombre}`}
        descripcion="El código de la estación no cambia."
      />
      <FormularioEstacion
        estacion={{
          id: estacion.id,
          codigo: estacion.codigo,
          nombre: estacion.nombre,
          municipalidadId: estacion.municipalidad.id,
          tieneParqueo: estacion.tieneParqueo,
          latitud: estacion.latitud,
          longitud: estacion.longitud,
        }}
        municipalidades={municipalidades.map((m) => ({ valor: String(m.id), etiqueta: m.nombre }))}
      />
    </div>
  );
}
