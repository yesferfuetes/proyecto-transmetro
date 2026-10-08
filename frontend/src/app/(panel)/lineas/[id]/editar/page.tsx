import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  esquemaId,
  exigirDatos,
  FormularioLinea,
  listarTodasLasMunicipalidades,
  obtenerLinea,
} from '@/modules/red';
import { InsigniaLinea } from '@/shared/components/datos';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Editar línea' };

export default async function PaginaEditarLinea({
  params,
}: PageProps<'/lineas/[id]/editar'>): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const [linea, municipalidades] = await Promise.all([
    obtenerLinea(id.data).then(exigirDatos),
    listarTodasLasMunicipalidades().then(exigirDatos),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <InsigniaLinea codigo={linea.codigo} tamano="grande" />
        <EncabezadoPagina destacado="Editar" resto={linea.nombre} />
      </div>
      <FormularioLinea
        linea={{
          id: linea.id,
          codigo: linea.codigo,
          nombre: linea.nombre,
          municipalidadId: linea.municipalidad.id,
          estado: linea.estado,
        }}
        municipalidades={municipalidades.map((m) => ({ valor: String(m.id), etiqueta: m.nombre }))}
      />
    </div>
  );
}
