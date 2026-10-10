import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  consultaNoDisponible,
  ConsultaNoDisponible,
  esquemaParametrosDeReporte,
  exigirDatos,
  leerReporteDeBuses,
  MarcoDeReporte,
  ResumenDeGrupos,
  ROLES_DE_REPORTES,
  TablaReporteDeBuses,
} from '@/modules/reportes';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión y de la constancia; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Reporte de buses por línea' };

export default async function PaginaReporteDeBuses({
  searchParams,
}: PageProps<'/reportes/buses'>): Promise<ReactElement> {
  await exigirSesion(ROLES_DE_REPORTES);
  const { consulta, pagina } = esquemaParametrosDeReporte.parse(await searchParams);
  if (consulta === undefined) {
    redirect('/reportes?aviso=generar');
  }
  const resultado = await leerReporteDeBuses(consulta, pagina);
  if (consultaNoDisponible(resultado)) {
    return <ConsultaNoDisponible />;
  }
  const reporte = exigirDatos(resultado);
  return (
    <MarcoDeReporte
      ruta="buses"
      resto="de buses por línea"
      descripcion="Los buses de cada línea y, al final, los que no tienen línea."
      consulta={reporte.consulta}
      total={reporte.total}
      pagina={reporte.pagina}
      tamano={reporte.tamano}
    >
      <ResumenDeGrupos grupos={reporte.grupos} />
      <TablaReporteDeBuses buses={reporte.elementos} />
    </MarcoDeReporte>
  );
}
