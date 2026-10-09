import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  esquemaFiltrosAccesos,
  exigirDatos,
  FiltrosAccesos,
  hrefConFiltros,
  listarAccesos,
  listarOpcionesDeEstacion,
  listarOpcionesDeLinea,
  TablaAccesosPorEstacion,
} from '@/modules/accesos';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Accesos' };

export default async function PaginaAccesos({
  searchParams,
}: PageProps<'/accesos'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const filtros = esquemaFiltrosAccesos.parse(await searchParams);
  const [pagina, estaciones, lineas] = await Promise.all([
    listarAccesos(filtros).then(exigirDatos),
    listarOpcionesDeEstacion().then(exigirDatos),
    listarOpcionesDeLinea().then(exigirDatos),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.tamano));
  const hrefDePagina = (numero: number): string =>
    hrefConFiltros('/accesos', { ...filtros, pagina: numero === 1 ? undefined : numero });
  const hayFiltros = [filtros.lineaId, filtros.estacionId, filtros.busqueda].some(
    (valor) => valor !== undefined,
  );

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Accesos"
        resto="de las estaciones"
        descripcion="Por dónde se entra a cada estación y cuántos guardias cubren cada acceso."
        acciones={
          <>
            {sesion.rol === 'SUPERVISOR_MUNICIPAL' ? (
              <EnlaceBoton
                href={hrefConFiltros('/accesos/nuevo', { estacionId: filtros.estacionId })}
                variante="principal"
                icono="accesos"
              >
                Nuevo acceso
              </EnlaceBoton>
            ) : null}
            {filtros.lineaId ? (
              <EnlaceBoton href={`/accesos/lineas/${filtros.lineaId}`} variante="secundario">
                Ver accesos de la línea
              </EnlaceBoton>
            ) : null}
            <EnlaceBoton href="/guardias" variante="secundario" icono="usuarios">
              Guardias
            </EnlaceBoton>
          </>
        }
      />
      <FiltrosAccesos
        filtros={filtros}
        estaciones={estaciones}
        lineas={lineas}
        total={pagina.total}
      />
      <TablaAccesosPorEstacion
        estaciones={pagina.elementos}
        estacionResaltadaId={sesion.rol === 'OPERADOR_ESTACION' ? sesion.estacion?.id : undefined}
        hayFiltros={hayFiltros}
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
