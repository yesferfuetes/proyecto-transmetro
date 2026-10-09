import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  DetalleAcceso,
  esquemaId,
  exigirDatos,
  FormularioAcceso,
  FormularioAsignacion,
  listarOpcionesDeGuardia,
  obtenerAcceso,
} from '@/modules/accesos';
import { Seccion, Tarjeta } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Acceso' };

export default async function PaginaAcceso({
  params,
}: PageProps<'/accesos/[id]'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const id = esquemaId.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const puedeEscribir = sesion.rol === 'SUPERVISOR_MUNICIPAL';
  const acceso = exigirDatos(await obtenerAcceso(id.data));
  const guardias = puedeEscribir ? exigirDatos(await listarOpcionesDeGuardia()) : [];
  return (
    <DetalleAcceso
      acceso={acceso}
      esTuEstacion={
        sesion.rol === 'OPERADOR_ESTACION' && sesion.estacion?.id === acceso.estacion.id
      }
      puedeEscribir={puedeEscribir}
      formularios={
        puedeEscribir ? (
          <>
            <Seccion id="asignar" destacado="Asignar" resto="un guardia">
              <Tarjeta>
                <FormularioAsignacion
                  accesoId={acceso.id}
                  guardias={guardias.map((g) => ({
                    valor: String(g.id),
                    etiqueta: `${g.nombre} · ${g.dpi}`,
                  }))}
                />
              </Tarjeta>
            </Seccion>
            <Seccion id="nombre" destacado="Nombre" resto="del acceso">
              <Tarjeta>
                <FormularioAcceso acceso={{ id: acceso.id, nombre: acceso.nombre }} />
              </Tarjeta>
            </Seccion>
          </>
        ) : undefined
      }
    />
  );
}
