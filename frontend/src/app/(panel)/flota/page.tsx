import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  esquemaFiltrosBuses,
  exigirDatos,
  FiltrosBuses,
  hayFiltrosDeBuses,
  hrefConFiltros,
  listarBuses,
  listarFlotaPorLinea,
  listarOpcionesDeParqueo,
  TablaBuses,
} from '@/modules/flota';
import { idsDeLineasDeEstacion } from '@/modules/red';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Flota' };

async function lineasDeLaEstacion(estacionId: number | undefined): Promise<number[]> {
  return estacionId === undefined ? [] : exigirDatos(await idsDeLineasDeEstacion(estacionId));
}

export default async function PaginaFlota({
  searchParams,
}: PageProps<'/flota'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const filtros = esquemaFiltrosBuses.parse(await searchParams);
  const estacionDelOperador = sesion.rol === 'OPERADOR_ESTACION' ? sesion.estacion?.id : undefined;
  const [pagina, flota, parqueos, resaltadas] = await Promise.all([
    listarBuses(filtros).then(exigirDatos),
    listarFlotaPorLinea().then(exigirDatos),
    listarOpcionesDeParqueo().then(exigirDatos),
    lineasDeLaEstacion(estacionDelOperador),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.tamano));
  const hrefDePagina = (numero: number): string =>
    hrefConFiltros('/flota', { ...filtros, pagina: numero === 1 ? undefined : numero });
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Flota"
        resto="de buses"
        descripcion="Capacidad, línea, parqueo y estado de cada bus."
        acciones={
          <>
            <EnlaceBoton href="/flota/lineas" variante="secundario" icono="lineas">
              Flota por línea
            </EnlaceBoton>
            <EnlaceBoton href="/flota/parqueos" variante="secundario" icono="parqueo">
              Parqueos
            </EnlaceBoton>
            {sesion.rol === 'SUPERVISOR_MUNICIPAL' ? (
              <EnlaceBoton href="/flota/nuevo" variante="principal" icono="bus">
                Nuevo bus
              </EnlaceBoton>
            ) : null}
          </>
        }
      />
      <FiltrosBuses
        filtros={filtros}
        lineas={flota.map((f) => f.linea)}
        parqueos={parqueos}
        total={pagina.total}
      />
      <TablaBuses
        buses={pagina.elementos}
        resaltadas={resaltadas}
        hayFiltros={hayFiltrosDeBuses(filtros)}
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
