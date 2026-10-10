import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  esquemaFiltrosPilotos,
  exigirDatos,
  FiltrosPilotos,
  hayFiltrosDePilotos,
  hrefConFiltros,
  listarOpciones,
  listarPilotos,
  TablaPilotos,
} from '@/modules/pilotos';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión y de su rol; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Pilotos' };

export default async function PaginaPilotos({
  searchParams,
}: PageProps<'/pilotos'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const filtros = esquemaFiltrosPilotos.parse(await searchParams);
  const [listado, opciones] = await Promise.all([
    listarPilotos(filtros).then(exigirDatos),
    listarOpciones().then(exigirDatos),
  ]);
  const { pagina } = listado;
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.tamano));
  const hrefDePagina = (numero: number): string =>
    hrefConFiltros('/pilotos', { ...filtros, pagina: numero === 1 ? undefined : numero });
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Pilotos"
        resto="de Transmetro"
        descripcion="Quién conduce cada bus y en qué línea trabaja."
        acciones={
          sesion.rol === 'SUPERVISOR_MUNICIPAL' ? (
            <EnlaceBoton href="/pilotos/nuevo" variante="principal" icono="pilotos">
              Nuevo piloto
            </EnlaceBoton>
          ) : null
        }
      />
      <FiltrosPilotos
        filtros={filtros}
        lineas={opciones.lineas}
        buses={opciones.buses}
        vista={listado.vista}
        total={pagina.total}
      />
      <TablaPilotos
        pilotos={pagina.elementos}
        vista={listado.vista}
        hayFiltros={hayFiltrosDePilotos(filtros)}
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
