import type { ReactElement, ReactNode } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { solicitudDeConsulta, type Consulta } from '../schemas/consulta';
import { BotonExportar } from './boton-exportar';
import { hrefConFiltros } from './presentacion';
import { ResumenDeFiltros } from './resumen-de-filtros';

type Propiedades = Readonly<{
  /** Segmento de la ruta del reporte: "estaciones", "lineas" o "buses". */
  ruta: string;
  resto: string;
  descripcion: string;
  consulta: Consulta;
  total: number;
  pagina: number;
  tamano: number;
  children: ReactNode;
}>;

/** Lo común a los tres reportes: título, exportar, filtros aplicados, tabla y páginas. */
export function MarcoDeReporte({
  ruta,
  resto,
  descripcion,
  consulta,
  total,
  pagina,
  tamano,
  children,
}: Propiedades): ReactElement {
  const totalPaginas = Math.max(1, Math.ceil(total / tamano));
  const hrefDePagina = (numero: number): string =>
    hrefConFiltros(`/reportes/${ruta}`, { consulta: consulta.id, pagina: numero });
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Reporte"
        resto={resto}
        descripcion={descripcion}
        acciones={
          <>
            <EnlaceBoton href="/reportes" variante="secundario" icono="reportes">
              Nuevo reporte
            </EnlaceBoton>
            <BotonExportar solicitud={solicitudDeConsulta(consulta)} />
          </>
        }
      />
      <ResumenDeFiltros consulta={consulta} total={total} />
      {children}
      {totalPaginas > 1 ? (
        <Paginacion pagina={pagina} totalPaginas={totalPaginas} hrefDePagina={hrefDePagina} />
      ) : null}
    </div>
  );
}
