import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  consultaNoDisponible,
  ConsultaNoDisponible,
  esquemaParametrosDeReporte,
  exigirDatos,
  leerReporteDeLineas,
  MarcoDeReporte,
  ROLES_DE_REPORTES,
  TablaReporteDeLineas,
} from '@/modules/reportes';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión y de la constancia; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Reporte de líneas' };

export default async function PaginaReporteDeLineas({
  searchParams,
}: PageProps<'/reportes/lineas'>): Promise<ReactElement> {
  await exigirSesion(ROLES_DE_REPORTES);
  const { consulta, pagina } = esquemaParametrosDeReporte.parse(await searchParams);
  if (consulta === undefined) {
    redirect('/reportes?aviso=generar');
  }
  const resultado = await leerReporteDeLineas(consulta, pagina);
  if (consultaNoDisponible(resultado)) {
    return <ConsultaNoDisponible />;
  }
  const reporte = exigirDatos(resultado);
  return (
    <MarcoDeReporte
      ruta="lineas"
      resto="de líneas"
      descripcion="Estaciones, longitud, buses y estado de la flota de cada línea."
      consulta={reporte.consulta}
      total={reporte.total}
      pagina={reporte.pagina}
      tamano={reporte.tamano}
    >
      <TablaReporteDeLineas lineas={reporte.elementos} />
    </MarcoDeReporte>
  );
}
