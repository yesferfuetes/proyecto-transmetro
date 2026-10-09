import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { exigirDatos, listarParqueos, TablaParqueos } from '@/modules/flota';
import { EnlaceBoton } from '@/shared/components/acciones';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Parqueos' };

export default async function PaginaParqueos(): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const parqueos = exigirDatos(await listarParqueos());
  const esSupervisor = sesion.rol === 'SUPERVISOR_MUNICIPAL';
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Parqueos"
        resto="de la red"
        descripcion="Capacidad de cada parqueo y los buses que guarda."
        acciones={
          <>
            <EnlaceBoton href="/flota" variante="secundario" icono="bus">
              Ver todos los buses
            </EnlaceBoton>
            {esSupervisor ? (
              <EnlaceBoton href="/flota/parqueos/nuevo" variante="principal" icono="parqueo">
                Nuevo parqueo
              </EnlaceBoton>
            ) : null}
          </>
        }
      />
      <TablaParqueos parqueos={parqueos} puedeEscribir={esSupervisor} />
    </div>
  );
}
