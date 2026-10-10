import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  CambioDeBus,
  DetallePiloto,
  esquemaId,
  exigirDatos,
  listarOpciones,
  obtenerPiloto,
  opcionesParaCambiar,
} from '@/modules/pilotos';
import { EnlaceBoton } from '@/shared/components/acciones';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión y de su rol; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Piloto' };

export default async function PaginaPiloto({
  params,
}: PageProps<'/pilotos/[id]'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const ficha = exigirDatos(await obtenerPiloto(id.data));
  const { piloto } = ficha;
  const puedeEscribir = sesion.rol === 'SUPERVISOR_MUNICIPAL';
  const opciones = puedeEscribir ? exigirDatos(await listarOpciones()) : null;
  return (
    <DetallePiloto
      ficha={ficha}
      acciones={
        puedeEscribir ? (
          <EnlaceBoton href={`/pilotos/${piloto.id}/editar`} variante="secundario">
            Editar expediente
          </EnlaceBoton>
        ) : null
      }
      cambioDeBus={
        opciones ? (
          <CambioDeBus
            pilotoId={piloto.id}
            busId={piloto.bus?.id ?? null}
            buses={opcionesParaCambiar(opciones.buses, piloto.bus)}
          />
        ) : null
      }
    />
  );
}
