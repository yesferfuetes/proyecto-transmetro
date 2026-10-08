import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { destinosPermitidos, RejillaMosaicos } from '@/shared/components/navegacion';
import { EncabezadoPagina, Seccion } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';
import { ETIQUETA_DE_ROL, type Rol } from '@/shared/schemas/sesion';
import { DESTINOS, ORDEN_DE_MOSAICOS } from '../destinos';

export const metadata: Metadata = { title: 'Inicio' };

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

function mosaicosDelRol(rol: Rol): ReturnType<typeof destinosPermitidos> {
  const permitidos = destinosPermitidos(DESTINOS, rol);
  return ORDEN_DE_MOSAICOS.flatMap((href) => permitidos.filter((destino) => destino.href === href));
}

/** Inicio común: los mosaicos son los mismos destinos que el menú permite al rol. */
export default async function Inicio(): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const rol = ETIQUETA_DE_ROL[sesion.rol];
  return (
    <>
      <EncabezadoPagina
        destacado="Inicio"
        resto=""
        descripcion={
          sesion.estacion === null
            ? `${sesion.nombre} · ${rol}`
            : `${sesion.nombre} · ${rol} en ${sesion.estacion.nombre}`
        }
      />
      <Seccion id="accesos-rapidos" destacado="Accesos" resto="rápidos">
        <RejillaMosaicos mosaicos={mosaicosDelRol(sesion.rol)} />
      </Seccion>
    </>
  );
}
