import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  esquemaFiltrosEstaciones,
  exigirDatos,
  FiltrosEstaciones,
  hrefConFiltros,
  listarEstaciones,
  listarLineas,
  listarTodasLasMunicipalidades,
  TablaEstaciones,
  TAMANO_MAXIMO,
} from '@/modules/red';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Estaciones' };

export default async function PaginaEstaciones({
  searchParams,
}: PageProps<'/estaciones'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const filtros = esquemaFiltrosEstaciones.parse(await searchParams);
  const [pagina, municipalidades, lineas] = await Promise.all([
    listarEstaciones(filtros).then(exigirDatos),
    listarTodasLasMunicipalidades().then(exigirDatos),
    listarLineas({ tamano: TAMANO_MAXIMO }).then(exigirDatos),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.tamano));
  const hrefDePagina = (numero: number): string =>
    hrefConFiltros('/estaciones', { ...filtros, pagina: numero === 1 ? undefined : numero });
  const hayFiltros = [
    filtros.municipalidadId,
    filtros.lineaId,
    filtros.tieneParqueo,
    filtros.busqueda,
  ].some((valor) => valor !== undefined);

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Estaciones"
        resto="de la red"
        descripcion="Municipalidad, parqueo y líneas que pasan por cada estación."
        acciones={
          sesion.rol === 'SUPERVISOR_MUNICIPAL' ? (
            <EnlaceBoton href="/estaciones/nueva" variante="principal" icono="estaciones">
              Nueva estación
            </EnlaceBoton>
          ) : null
        }
      />
      <FiltrosEstaciones
        filtros={filtros}
        municipalidades={municipalidades}
        lineas={lineas.elementos}
        total={pagina.total}
      />
      <TablaEstaciones
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
