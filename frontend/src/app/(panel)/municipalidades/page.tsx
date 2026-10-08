import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  esquemaFiltrosMunicipalidades,
  exigirDatos,
  hrefConFiltros,
  listarMunicipalidades,
  TablaMunicipalidades,
} from '@/modules/red';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Municipalidades' };

export default async function PaginaMunicipalidades({
  searchParams,
}: PageProps<'/municipalidades'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const { pagina: numero } = esquemaFiltrosMunicipalidades.parse(await searchParams);
  const pagina = exigirDatos(await listarMunicipalidades(numero));
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.tamano));
  const esAdministrador = sesion.rol === 'ADMINISTRADOR';

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Municipalidades"
        resto="de la red"
        descripcion="Municipios donde opera Transmetro y su parte de la red."
        acciones={
          esAdministrador ? (
            <EnlaceBoton href="/municipalidades/nueva" variante="principal" icono="municipalidad">
              Nueva municipalidad
            </EnlaceBoton>
          ) : null
        }
      />
      <TablaMunicipalidades municipalidades={pagina.elementos} puedeEditar={esAdministrador} />
      {totalPaginas > 1 ? (
        <Paginacion
          pagina={numero}
          totalPaginas={totalPaginas}
          hrefDePagina={(n) =>
            hrefConFiltros('/municipalidades', { pagina: n === 1 ? undefined : n })
          }
        />
      ) : null}
    </div>
  );
}
