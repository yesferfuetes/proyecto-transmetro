import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  esquemaFiltrosDeBitacora,
  exigirDatos,
  FiltrosBitacora,
  listarBitacora,
  listarOpciones,
  ROLES_DE_REPORTES,
  TablaBitacora,
} from '@/modules/reportes';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { Aviso } from '@/shared/components/superposiciones';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión y siempre se lee al momento; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Bitácora de consultas' };

function hrefDePagina(
  filtros: Record<string, string | number | undefined>,
  numero: number,
): string {
  const consulta = new URLSearchParams();
  for (const [clave, valor] of Object.entries({ ...filtros, pagina: numero })) {
    if (valor !== undefined) {
      consulta.set(clave, String(valor));
    }
  }
  return `/reportes/bitacora?${consulta.toString()}`;
}

export default async function PaginaBitacora({
  searchParams,
}: PageProps<'/reportes/bitacora'>): Promise<ReactElement> {
  await exigirSesion(ROLES_DE_REPORTES);
  const filtros = esquemaFiltrosDeBitacora.parse(await searchParams);
  const [resultado, opciones] = await Promise.all([
    listarBitacora(filtros),
    listarOpciones().then(exigirDatos),
  ]);
  // Un rango con inicio posterior al fin no es una falla: el backend lo explica y se muestra tal cual.
  const rangoInvalido = !resultado.ok && resultado.error.codigo === 'RANGO_DE_FECHAS_INVALIDO';
  const pagina = rangoInvalido ? null : exigirDatos(resultado);
  const totalPaginas = pagina ? Math.max(1, Math.ceil(pagina.total / pagina.tamano)) : 1;
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Bitácora"
        resto="de consultas"
        descripcion="Quién consultó qué reporte, con qué filtros y cuándo. Consultarla no deja constancia."
        acciones={
          <EnlaceBoton href="/reportes" variante="secundario" icono="reportes">
            Generar un reporte
          </EnlaceBoton>
        }
      />
      <FiltrosBitacora filtros={filtros} usuarios={opciones.usuarios} total={pagina?.total ?? 0} />
      {!resultado.ok && rangoInvalido ? (
        <Aviso estado="error" titulo={resultado.error.mensaje} />
      ) : null}
      {pagina ? <TablaBitacora constancias={pagina.elementos} /> : null}
      {totalPaginas > 1 ? (
        <Paginacion
          pagina={filtros.pagina}
          totalPaginas={totalPaginas}
          hrefDePagina={(numero) => hrefDePagina({ ...filtros, pagina: undefined }, numero)}
        />
      ) : null}
    </div>
  );
}
