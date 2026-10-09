import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  CambioDeEstado,
  CambioDeLinea,
  CambioDeParqueo,
  DetalleBus,
  esquemaId,
  exigirDatos,
  listarOpcionesDeLinea,
  listarOpcionesDeParqueo,
  obtenerBus,
  opcionDeLinea,
  opcionDeParqueo,
} from '@/modules/flota';
import { EnlaceBoton } from '@/shared/components/acciones';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Bus' };

export default async function PaginaBus({
  params,
}: PageProps<'/flota/[id]'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const bus = exigirDatos(await obtenerBus(id.data));
  // Un bus de baja no cambia; los formularios de escritura son solo del supervisor.
  const puedeEscribir = sesion.rol === 'SUPERVISOR_MUNICIPAL' && bus.estado !== 'BAJA';
  const [lineas, parqueos] = puedeEscribir
    ? await Promise.all([
        listarOpcionesDeLinea().then(exigirDatos),
        listarOpcionesDeParqueo().then(exigirDatos),
      ])
    : [[], []];
  return (
    <DetalleBus
      bus={bus}
      acciones={
        puedeEscribir ? (
          <EnlaceBoton href={`/flota/${bus.id}/editar`} variante="secundario">
            Editar capacidad
          </EnlaceBoton>
        ) : null
      }
      cambioDeLinea={
        puedeEscribir ? (
          <CambioDeLinea
            busId={bus.id}
            lineaId={bus.linea?.id ?? null}
            lineas={lineas.map(opcionDeLinea)}
          />
        ) : null
      }
      cambioDeParqueo={
        puedeEscribir ? (
          <CambioDeParqueo
            busId={bus.id}
            parqueoId={bus.parqueo.id}
            parqueos={parqueos.map(opcionDeParqueo)}
          />
        ) : null
      }
      cambioDeEstado={puedeEscribir ? <CambioDeEstado busId={bus.id} estado={bus.estado} /> : null}
    />
  );
}
