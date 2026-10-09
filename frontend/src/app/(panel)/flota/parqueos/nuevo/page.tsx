import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { exigirDatos, FormularioParqueo, listarOpcionesDeEstacion } from '@/modules/flota';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Nuevo parqueo' };

export default async function PaginaNuevoParqueo(): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const estaciones = exigirDatos(await listarOpcionesDeEstacion());
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Nuevo"
        resto="parqueo"
        descripcion="Solo las estaciones marcadas con parqueo pueden tener uno."
      />
      <FormularioParqueo
        estaciones={estaciones.map((e) => ({
          valor: String(e.id),
          etiqueta: `${e.codigo} · ${e.nombre}`,
        }))}
      />
    </div>
  );
}
