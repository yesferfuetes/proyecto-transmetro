import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  exigirDatos,
  FormularioBus,
  listarOpcionesDeLinea,
  listarOpcionesDeParqueo,
  opcionDeLinea,
  opcionDeParqueo,
} from '@/modules/flota';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Nuevo bus' };

export default async function PaginaNuevoBus(): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const [parqueos, lineas] = await Promise.all([
    listarOpcionesDeParqueo().then(exigirDatos),
    listarOpcionesDeLinea().then(exigirDatos),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Nuevo"
        resto="bus"
        descripcion="Todo bus se guarda en un parqueo; la línea es opcional y puede asignarse después."
      />
      <FormularioBus parqueos={parqueos.map(opcionDeParqueo)} lineas={lineas.map(opcionDeLinea)} />
    </div>
  );
}
