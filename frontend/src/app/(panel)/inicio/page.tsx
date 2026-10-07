import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { destinosPermitidos, RejillaMosaicos } from '@/shared/components/navegacion';
import { Seccion } from '@/shared/components/superficies';
import { obtenerResumenDeEjemplo } from '../_ejemplo/inicio';
import { obtenerSesionDeEjemplo } from '../_ejemplo/sesion';
import { DESTINOS, ORDEN_DE_MOSAICOS } from '../destinos';
import { AlertasRecientes } from './_componentes/alertas-recientes';
import { FranjaInicio } from './_componentes/franja-inicio';

export const metadata: Metadata = { title: 'Inicio' };

function mosaicosDelRol(rol: string): ReturnType<typeof destinosPermitidos> {
  const permitidos = destinosPermitidos(DESTINOS, rol);
  return ORDEN_DE_MOSAICOS.flatMap((href) => permitidos.filter((destino) => destino.href === href));
}

export default async function Inicio(): Promise<ReactElement> {
  const sesion = await obtenerSesionDeEjemplo();
  const resumen = await obtenerResumenDeEjemplo(sesion);
  return (
    <>
      <h1 className="sr-only">Inicio</h1>
      <FranjaInicio resumen={resumen} />
      <Seccion id="accesos-rapidos" destacado="Accesos" resto="rápidos">
        <RejillaMosaicos mosaicos={mosaicosDelRol(sesion.rol)} />
      </Seccion>
      <Seccion
        id="alertas-recientes"
        destacado="Alertas"
        resto="recientes"
        acciones={
          <Link
            href="/alertas"
            className="rounded-full px-3 py-2 text-label text-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Ver todas
          </Link>
        }
      >
        <AlertasRecientes alertas={resumen.recientes} />
      </Seccion>
    </>
  );
}
