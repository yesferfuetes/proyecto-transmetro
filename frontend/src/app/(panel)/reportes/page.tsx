import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  exigirDatos,
  FormularioDeReporte,
  listarOpciones,
  opcionesDelFormulario,
  ROLES_DE_REPORTES,
} from '@/modules/reportes';
import { EnlaceBoton } from '@/shared/components/acciones';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { Aviso } from '@/shared/components/superposiciones';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión y de las opciones vigentes; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Reportes' };

export default async function PaginaReportes({
  searchParams,
}: PageProps<'/reportes'>): Promise<ReactElement> {
  await exigirSesion(ROLES_DE_REPORTES);
  const { aviso } = await searchParams;
  const opciones = exigirDatos(await listarOpciones());
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Reportes"
        resto="de la red"
        descripcion="Elige el reporte y sus filtros. Cada consulta queda registrada en la bitácora."
        acciones={
          <EnlaceBoton href="/reportes/bitacora" variante="secundario" icono="reportes">
            Bitácora de consultas
          </EnlaceBoton>
        }
      />
      {aviso === 'generar' ? (
        <Aviso estado="informacion" titulo="Genera el reporte primero">
          Elige el tipo de reporte y pulsa «Generar reporte».
        </Aviso>
      ) : null}
      <FormularioDeReporte opciones={opcionesDelFormulario(opciones)} />
    </div>
  );
}
