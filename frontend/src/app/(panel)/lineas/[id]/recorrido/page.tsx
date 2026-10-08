import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  EditorDeRecorrido,
  esquemaId,
  exigirDatos,
  filasDeRecorrido,
  listarOpcionesDeEstacion,
  obtenerLinea,
} from '@/modules/red';
import { InsigniaLinea } from '@/shared/components/datos';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Recorrido de la línea' };

export default async function PaginaRecorrido({
  params,
}: PageProps<'/lineas/[id]/recorrido'>): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const [linea, estaciones] = await Promise.all([
    obtenerLinea(id.data).then(exigirDatos),
    listarOpcionesDeEstacion().then(exigirDatos),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <InsigniaLinea codigo={linea.codigo} tamano="grande" />
        <EncabezadoPagina
          destacado="Recorrido"
          resto={`de ${linea.nombre}`}
          descripcion="Ordena las estaciones y escribe la distancia de cada una a la siguiente. Al guardar se reemplaza el recorrido completo."
        />
      </div>
      <EditorDeRecorrido
        lineaId={linea.id}
        codigoLinea={linea.codigo}
        recorrido={filasDeRecorrido(linea.recorrido)}
        estaciones={estaciones}
      />
    </div>
  );
}
