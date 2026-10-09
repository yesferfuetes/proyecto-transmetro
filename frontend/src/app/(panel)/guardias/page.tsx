import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  esquemaFiltrosGuardias,
  exigirDatos,
  FiltrosGuardias,
  hrefConFiltros,
  listarGuardias,
  TablaGuardias,
} from '@/modules/accesos';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Guardias' };

export default async function PaginaGuardias({
  searchParams,
}: PageProps<'/guardias'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const filtros = esquemaFiltrosGuardias.parse(await searchParams);
  const pagina = exigirDatos(await listarGuardias(filtros));
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.tamano));
  const hrefDePagina = (numero: number): string =>
    hrefConFiltros('/guardias', { ...filtros, pagina: numero === 1 ? undefined : numero });
  const puedeEscribir = sesion.rol === 'SUPERVISOR_MUNICIPAL';

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Guardias"
        resto="de seguridad"
        descripcion="Cuántos accesos cubre cada guardia; los que no tienen asignación se marcan."
        acciones={
          <>
            {puedeEscribir ? (
              <EnlaceBoton href="/guardias/nuevo" variante="principal" icono="usuarios">
                Nuevo guardia
              </EnlaceBoton>
            ) : null}
            <EnlaceBoton href="/accesos" variante="secundario" icono="accesos">
              Accesos
            </EnlaceBoton>
          </>
        }
      />
      <FiltrosGuardias filtros={filtros} total={pagina.total} />
      <TablaGuardias
        guardias={pagina.elementos}
        puedeEditar={puedeEscribir}
        hayFiltros={filtros.busqueda !== undefined}
      />
      {totalPaginas > 1 ? (
        <Paginacion
          pagina={filtros.pagina}
          totalPaginas={totalPaginas}
          hrefDePagina={hrefDePagina}
        />
      ) : null}
    </div>
  );
}
