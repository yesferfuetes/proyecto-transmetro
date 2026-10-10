import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  consultaNoDisponible,
  ConsultaNoDisponible,
  esquemaParametrosDeReporte,
  exigirDatos,
  leerReporteDeEstaciones,
  MarcoDeReporte,
  ROLES_DE_REPORTES,
  TablaReporteDeEstaciones,
} from '@/modules/reportes';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión y de la constancia; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Reporte de estaciones' };

export default async function PaginaReporteDeEstaciones({
  searchParams,
}: PageProps<'/reportes/estaciones'>): Promise<ReactElement> {
  await exigirSesion(ROLES_DE_REPORTES);
  const { consulta, pagina } = esquemaParametrosDeReporte.parse(await searchParams);
  if (consulta === undefined) {
    redirect('/reportes?aviso=generar');
  }
  const resultado = await leerReporteDeEstaciones(consulta, pagina);
  if (consultaNoDisponible(resultado)) {
    return <ConsultaNoDisponible />;
  }
  const reporte = exigirDatos(resultado);
  return (
    <MarcoDeReporte
      ruta="estaciones"
      resto="de estaciones"
      descripcion="Municipalidad, líneas que pasan por cada estación y si tiene parqueo."
      consulta={reporte.consulta}
      total={reporte.total}
      pagina={reporte.pagina}
      tamano={reporte.tamano}
    >
      <TablaReporteDeEstaciones estaciones={reporte.elementos} />
    </MarcoDeReporte>
  );
}
