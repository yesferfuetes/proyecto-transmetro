import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { exigirDatos, FormularioPiloto, listarOpciones, opcionDeBus } from '@/modules/pilotos';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Nuevo piloto' };

export default async function PaginaNuevoPiloto(): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const opciones = exigirDatos(await listarOpciones());
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Nuevo"
        resto="piloto"
        descripcion="Dirección, teléfono e historial educativo son obligatorios; el bus se puede asignar después."
      />
      <FormularioPiloto buses={opciones.buses.map(opcionDeBus)} />
    </div>
  );
}
