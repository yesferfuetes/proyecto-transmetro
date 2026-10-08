import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { exigirDatos, FormularioEstacion, listarTodasLasMunicipalidades } from '@/modules/red';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Nueva estación' };

export default async function PaginaNuevaEstacion(): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const municipalidades = exigirDatos(await listarTodasLasMunicipalidades());
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Nueva"
        resto="estación"
        descripcion="Queda sin línea hasta que la incluyas en un recorrido."
      />
      <FormularioEstacion
        municipalidades={municipalidades.map((m) => ({ valor: String(m.id), etiqueta: m.nombre }))}
      />
    </div>
  );
}
