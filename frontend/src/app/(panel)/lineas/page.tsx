import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  esquemaFiltrosLineas,
  exigirDatos,
  FiltrosLineas,
  hrefConFiltros,
  idsDeLineasDeEstacion,
  listarLineas,
  listarTodasLasMunicipalidades,
  TablaLineas,
} from '@/modules/red';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Líneas' };

async function lineasDeLaEstacion(estacionId: number | undefined): Promise<number[]> {
  return estacionId === undefined ? [] : exigirDatos(await idsDeLineasDeEstacion(estacionId));
}

export default async function PaginaLineas({
  searchParams,
}: PageProps<'/lineas'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const filtros = esquemaFiltrosLineas.parse(await searchParams);
  const estacionDelOperador = sesion.rol === 'OPERADOR_ESTACION' ? sesion.estacion?.id : undefined;
  const [pagina, municipalidades, resaltadas] = await Promise.all([
    listarLineas(filtros).then(exigirDatos),
    listarTodasLasMunicipalidades().then(exigirDatos),
    lineasDeLaEstacion(estacionDelOperador),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.tamano));
  const hrefDePagina = (numero: number): string =>
    hrefConFiltros('/lineas', { ...filtros, pagina: numero === 1 ? undefined : numero });

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Líneas"
        resto="de la red"
        descripcion="Estado, recorrido y longitud de cada línea."
        acciones={
          sesion.rol === 'SUPERVISOR_MUNICIPAL' ? (
            <EnlaceBoton href="/lineas/nueva" variante="principal" icono="lineas">
              Nueva línea
            </EnlaceBoton>
          ) : null
        }
      />
      <FiltrosLineas filtros={filtros} municipalidades={municipalidades} total={pagina.total} />
      <TablaLineas
        lineas={pagina.elementos}
        resaltadas={resaltadas}
        hayFiltros={filtros.municipalidadId !== undefined || filtros.estado !== undefined}
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
